import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import OWAIcon from './assets/img/owa_logo.png';
import {
  ChakraProvider,
  Center,
  theme
} from '@chakra-ui/react';
import Hero from "./components/sections/Hero";
import MySubscriptions from "./views/MySubscriptions";
import BuySubscriptions from "./views/BuySubscriptions";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useWalletSelector } from "./utils/walletSelector";

export default function Landing() {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [stateLogin, setStateLogin] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    (async () => {
      setStateLogin(accountId !=null ? true : false);
      setLoad(true);
    })();
  }, []);

  if (stateLogin && load) {
    return (
      <ChakraProvider theme={theme}>
        <Center>
          <>
            <div style={{width:'100%'}}>
              <div style={{width:'100%', position:'sticky', top:'0px', zIndex:'10'}}>
                <Header />
              </div>
              <div style={{width:'100%', marginBottom:'64px'}}>
                <Routes>
                  <Route path="/mysubscriptions" exact element={<MySubscriptions/>} />
                  <Route path="/buysubscriptions" exact element={<BuySubscriptions/>} />
                  <Route path="/*" exact element={<MySubscriptions/>} />
                </Routes>
              </div>
              <div style={{width:'100%', position:'fixed', bottom:'0px', right:'0px', left:'0px'}}>
                <Footer/>
              </div>
            </div>
          </>
        </Center>
      </ChakraProvider>
    );
  } if (!stateLogin && load) {
      return (
        <ChakraProvider theme={theme}>
          <Center>
          <>
            <div style={{width:'100%'}}>
              <Hero
                title="Bienvenidos a Open Web Academy"
                subtitle="Ingresa para poder adquirir suscripciones al contenido de OWA, da clic en el siguiente botón para hacerlo con tu NEAR Wallet."
                image={OWAIcon}
                ctaText="Iniciar Sesión"
              />
              <div style={{width:'100%', position:'fixed', bottom:'0px', right:'0px', left:'0px'}}>
                <Footer/>
              </div>
            </div>
          </>
          </Center>
        </ChakraProvider>
      );
    
  }

  
}