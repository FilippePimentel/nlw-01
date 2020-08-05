import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation, useRoute} from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
    id: number;
    titulo: string;
    imagem_url: string;
}

interface Ponto {
    id: number;
    nome: string;
    imagem: string;
    imagem_url: string;
    latitude: number;
    longitude: number;
}

interface Params{
    uf: string;
    cidade: string;
}

const Pontos = () => {
    const [itens, setItens] = useState<Item[]>([]);
    const [itensSelecionados, setItensSelecionado] = useState<number[]>([]);
    const [pontos, setPontos] = useState<Ponto[]>([]);
    const [posicaoSelecionada, setPosicaoSelecionada] = useState<[number, number]>([0, 0]);
    const route = useRoute();

    const routeParams = route.params as Params;

    const navigation = useNavigation();

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();


            if (status !== 'granted') {
                Alert.alert('Ooops', 'Precisamos da sua permissão para obter a localização');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;

            setPosicaoSelecionada([
                latitude, longitude
            ]);
        }
        loadPosition();
    }, []);


    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        });
    }, []);

    useEffect(() => {
        api.get('pontos', {
            params: {
                cidade: routeParams.cidade,
                uf: routeParams.uf,
                itens: itensSelecionados
            }
        }).then(response => setPontos(response.data));
    }, [itensSelecionados]);

    function handleNavigateBack() {
        navigation.goBack();
    };
    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detalhe', {ponto_id: id});
    }
    function handleSelectItem(id: number) {
        const itemJaSelecionado = itensSelecionados.findIndex(item => item === id); //Retorna um número acima ou igual ao zero se já tiver

        if (itemJaSelecionado >= 0) {
            const itensFiltrados = itensSelecionados.filter(item => item !== id);
            setItensSelecionado(itensFiltrados);
        }
        else {
            setItensSelecionado([...itensSelecionados, id]);
        }
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {posicaoSelecionada[0] !== 0 && (
                        <MapView style={styles.map}
                            initialRegion={{
                                latitude: posicaoSelecionada[0],
                                longitude: posicaoSelecionada[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014,
                            }}>
                            {pontos.map(ponto => (
                                <Marker
                                    key={String(ponto.id)}
                                    style={styles.mapMarker}
                                    onPress={() => handleNavigateToDetail(ponto.id)}
                                    coordinate={{
                                        latitude: ponto.latitude,
                                        longitude: ponto.longitude,
                                    }} >
                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage} source={{ uri: ponto.imagem_url }} />
                                        <Text style={styles.mapMarkerTitle}>{ponto.nome}</Text>
                                    </View>
                                </Marker>

                            ))}
                        </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {itens.map(item => (
                        <TouchableOpacity key={String(item.id)}
                            style={[styles.item, itensSelecionados.includes(item.id) ? styles.selectedItem : {}]}
                            onPress={() => handleSelectItem(item.id)}
                            activeOpacity={0.6}>
                            <SvgUri width={42} height={42} uri={item.imagem_url} />
                            <Text style={styles.itemTitle}>{item.titulo}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Pontos;

