import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from '../Layout';
import { Map } from '../Map';
//import { MosqueList } from '../MosqueList';
import { MosqueListServer } from '../MosqueListServer';

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path='/' component={Map} />
                <Route path='/MosqueListServer' component={MosqueListServer} />
            </Layout>
        );
    }
}
