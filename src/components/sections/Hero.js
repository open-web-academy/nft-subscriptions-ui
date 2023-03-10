import React, { useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { login } from '../../utils';
import { useWalletSelector } from "../../utils/walletSelector";

import {
  Box,
  Button,
  Flex,
  Image,
  Heading,
  Stack,
  Text,
  ChakraProvider
} from "@chakra-ui/react";

export default function Hero({
  title,
  subtitle,
  image,
  ctaLink,
  ctaText,
  ...rest
}) {

  const { selector, modal, accounts, accountId, logged } = useWalletSelector();
  const [signIn, setSignIn] = useState(false);

  useEffect(() => {
    if(signIn){
      window.location.reload();
    }
  }, [accountId]);

  const handleSignIn = () =>{
    modal.show();
    setSignIn(true);
  }

  return (
    <Flex
    align="center"
    justify={{ base: "center", md: "space-around", xl: "space-between" }}
    direction={{ base: "column-reverse", md: "row" }}
    wrap="no-wrap"
    minH="70vh"
    px={8}
    mb={16}
    {...rest}
  >
    <Stack
      spacing={4}
      w={{ base: "80%", md: "40%" }}
      align={["center", "center", "flex-start", "flex-start"]}
    >
      <Heading
        as="h1"
        size="xl"
        fontWeight="bold"
        color="primary.800"
        textAlign={["center", "center", "left", "left"]}
      >
        {title}
      </Heading>
      <Heading
        as="h2"
        size="md"
        color="primary.800"
        opacity="0.8"
        fontWeight="normal"
        lineHeight={1.5}
        textAlign={["center", "center", "left", "left"]}
      >
        {subtitle}
      </Heading>
        <Button
          bg='tomato'
          colorScheme="primary"
          borderRadius="8px"
          py="4"
          px="4"
          lineHeight="1"
          size="md"
          onClick={handleSignIn}
        >
          {ctaText}
        </Button>
    </Stack>
    <Box w={{ base: "80%", sm: "60%", md: "50%" }} mb={{ base: 12, md: 0 }}>
      {/* TODO: Make this change every X secs */}
      <Image src={image} size="100%" rounded="1rem" shadow="2xl" mx="auto" />
    </Box>
  </Flex>
  )
}

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string
};
