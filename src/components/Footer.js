import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    Box,
    chakra,
    Container,
    Stack,
    Text,
    useColorModeValue,
    VisuallyHidden,
  } from '@chakra-ui/react';
  import { FaDiscord, FaGithub, FaGlobe, FaMedium, FaTwitter, FaYoutube } from 'react-icons/fa';
  import { ReactNode } from 'react';
  import { ColorModeSwitcher } from '../utils/ColorModeSwitcher';

  const SocialButton = ({
    children,
    label,
    href,
  }) => {
    return (
      <chakra.button
        bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
        rounded={'full'}
        w={8}
        h={8}
        cursor={'pointer'}
        as={'a'}
        target="_blank"
        href={href}
        display={'inline-flex'}
        alignItems={'center'}
        justifyContent={'center'}
        transition={'background 0.3s ease'}
        _hover={{
          bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
        }}>
        <VisuallyHidden>{label}</VisuallyHidden>
        {children}
      </chakra.button>
    );
  };
  
  export default function SmallWithSocial() {
    return (
      <Box
        bg={useColorModeValue('gray.50', 'gray.900')}
        color={useColorModeValue('gray.700', 'gray.200')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}>
          <Text>© 2023 Open Web Academy</Text>
          <Stack direction={'row'} spacing={6} align={'center'}>
            <SocialButton label={'OWA'} href={'https://ow.academy/'} target="_blank">
              <FaGlobe />
            </SocialButton>
            <SocialButton label={'Discord'} href={'https://discord.com/invite/XhGJXszkyc'}>
              <FaDiscord />
            </SocialButton>
            <SocialButton label={'Twitter'} href={'https://twitter.com/openwebacademy_'} >
              <FaTwitter />
            </SocialButton>
            <SocialButton label={'YouTube'} href={'https://www.youtube.com/channel/UChcuH69iuHbFGBy1qunVzNw'}>
              <FaYoutube />
            </SocialButton>
            <SocialButton label={'Medium'} href={'https://medium.com/@owa_academy'}>
              <FaMedium />
            </SocialButton>
            <SocialButton label={'GitHub'} href={'https://github.com/open-web-academy'}>
              <FaGithub />
            </SocialButton>
          </Stack>
        </Container>
      </Box>
    );
  }