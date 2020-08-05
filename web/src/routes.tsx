import React from 'react';
import { Route, BrowserRouter, RouteProps } from 'react-router-dom'; //npm install @types/react-router-dom - D

import Home from './pages/home';
import CreatePoint from './pages/CreatePoint';


const Routes = () => {
    return (
        <BrowserRouter>
            <Route component= {Home} path="/" exact/>
            <Route component= {CreatePoint} path="/create-point"/>
        </BrowserRouter>
    );

}

export default Routes;