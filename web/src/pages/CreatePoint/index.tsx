import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'; //useEffect -> função que permite você escolher quando e qual função carregar. Evita carregamente desnecessário
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'; //npm install @types/react-leaflet -D
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import './style.css';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface item {
    id: number;
    titulo: string;
    imagem_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECidadeResponse {
    nome: string;
}

const CreatePoint = () => {
    //parametros - função - quantidade de execuções... vazio significa que apenas será executado no carregamento da página
    //sempre que cria um estado para um array ou objeto, precisa manualmente informar o tipo da vaviavel.
    const [itens, setItens] = useState<item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);

    const [PosicaoInicial, setPosicaoInicial] = useState<[number, number]>([0, 0]);

    const [UFSelecionada, setUfSelecionada] = useState('0');
    const [CidadeSelecionada, setCidadeSelecionada] = useState('0');

    const [posicaoSelecionada, setPosicaoSelecionada] = useState<[number, number]>([0, 0]);
    const [imagemSelecionada, setImagemSelecionada] = useState<File>();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
    });

    const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setPosicaoInicial([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufBrasileiras = response.data.map(uf => uf.sigla);
            setUfs(ufBrasileiras);
        });
    }, []);

    useEffect(() => {

        if (UFSelecionada === '0') {
            return;
        }

        axios.get<IBGECidadeResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UFSelecionada}/municipios`)
            .then(response => {
                const cidadesPorUF = response.data.map(cidade => cidade.nome);
                setCidades(cidadesPorUF);
            });
    }, [UFSelecionada]);


    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const UF = event.target.value;
        setUfSelecionada(UF);
    }

    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>) {
        const Cidade = event.target.value;
        setCidadeSelecionada(Cidade);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setPosicaoSelecionada([event.latlng.lat, event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    //Não podemos alterar a informação principal, precisamos criar um nova infoormação contendo a o que queremos inserir
    function handleSelectItem(id: number) {
        const itemJaSelecionado = itensSelecionados.findIndex(item => item === id); //Retorna um número acima ou igual ao zero se já tiver

        if (itemJaSelecionado >= 0) {
            const itensFiltrados = itensSelecionados.filter(item => item !== id);
            setItensSelecionados(itensFiltrados);
        }
        else {
            setItensSelecionados([...itensSelecionados, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { nome, email, whatsapp } = formData;
        const uf = UFSelecionada;
        const cidade = CidadeSelecionada;
        const [latitude, longitude] = posicaoSelecionada;
        const itens = itensSelecionados;

        const data = new FormData();

        data.append('nome', nome);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('cidade', cidade);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('itens', itens.join(','));

        if (imagemSelecionada) {
            data.append('imagem', imagemSelecionada);
        }

        await api.post('pontos', data);
        alert('Ponto de coleta criado');
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar pra home
                </Link>
            </header >
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setImagemSelecionada} />

                <fieldset>
                    < legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            onChange={handleInputChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    {/*PosicaoInicial*/}
                    <Map center={[-22.8113132, -43.3203739]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={posicaoSelecionada} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={UFSelecionada}
                                onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select
                                name="cidade"
                                id="cidade"
                                value={CidadeSelecionada}
                                onChange={handleSelectCidade}>
                                <option value="0">Selecione uma Cidade</option>
                                {cidades.map(cidades => (
                                    <option key={cidades} value={cidades}>{cidades}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {itens.map(item => (
                            <li key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={itensSelecionados.includes(item.id) ? 'selected' : ''}>
                                <img src={item.imagem_url} alt={item.titulo} />
                                <span>{item.titulo}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;
//MAPA REACT LEAFLET - npm install leaflet react-leaflet
//INSTALAR BIBLIOTECA PARA CONVERSAR COM A API - AXIOS -> npm install axios
// Typescript cheat sheat
//unsplash Site com imagens 

//CTRL + D seleciona todos os iguais
//Shift + Alt + Baixo Copia a linha
//Crtl + Alt => seleciona tudo
//Shift + alt + I => selecia uma quanidade de linha e coloca o cursor no final 



