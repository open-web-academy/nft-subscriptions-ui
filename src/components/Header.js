import React, { useCallback, useContext, useEffect, useState } from "react";
import { useWalletSelector, getAccountBalance } from "../utils/walletSelector";
import Swal from 'sweetalert2';
import OWAIcon from '../assets/img/owa_logo.png';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { providers, utils } from "near-api-js";
import { prettyBalance } from '../utils/common';
import {
    Box,
    Flex,
    Text,
    Avatar,
    IconButton,
    Button,
    Divider,
    Stack,
    Collapse,
    Icon,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useBreakpointValue,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorMode,
    Center,
  } from '@chakra-ui/react';
  import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
  } from '@chakra-ui/icons';
  
  export default function WithSubnavigation() {
    const { selector, modal, accountBalance, accounts, accountId, logged } = useWalletSelector();
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
    const [load, setLoad] = useState(false);
    const [balanceUSDT, setBalanceUSDT] = useState();
    const [balanceNEAR, setBalanceNEAR] = useState();
    
    useEffect(() => {
      (async () => {
          const { network } = selector.options;
          const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
          let params = {
            account_id: accountId,
          };

          const tokens = await provider.query({
              request_type: "call_function",
              account_id: process.env.REACT_APP_USDT_CONTRACT,
              method_name: "ft_balance_of",
              args_base64: btoa(JSON.stringify(params)),
              finality: "optimistic",
          });
          const balance = parseInt(Buffer.from(tokens.result).toString().replace(/['"]+/g, ''));
          const nears = await getAccountBalance(accountId);
          const pnears = prettyBalance(nears.available, 24, 4);
          
          setTimeout(() => {
            setBalanceNEAR(pnears);
            setBalanceUSDT(balance/1000000);
            setLoad(true);
          }, 1000);
         
      })();
  }, []);

    async function logOut() {
      const wallet = await selector.wallet();
      Swal.fire({
        width: '800',
        title: '¿QUIERES SALIR?',
        text: "Recuerda que para navegar el sitio de manera correcta es necesario que esté conectada tu wallet, de igual forma puedes conectarla en cualquier momento",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Salir',
        cancelButtonText: 'Cancelar',
        position: window.innerWidth < 1024 ? 'bottom' : 'center'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('userMedia');
          wallet.signOut().catch((err) => {
            console.log("Failed to sign out");
            console.error(err);
          }).then((res) => {
            window.location.href = "/"
          })
        }
      });
    }

    return (
      <Box w='100%'>
        <Flex
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.900')}
          align={'center'}>
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}>
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Avatar
                  size={'sm'}
                  src={ OWAIcon }
            />
            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>
  
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    // src={'https://avatars.dicebear.com/api/male/username.svg'}
                    name={accountId}
                    src={'https://bit.ly/broken-link'}
                    size={'sm'}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={'https://avatars.dicebear.com/api/male/username.svg'}
                    />
                  </Center>
                  <br />
                  <Center>
                    { accountId && load &&
                      <p> 
                        <b>{accountId}</b><br/><br/>
                        <Divider /><br/>
                        <b>NEAR:</b> {balanceNEAR} Ⓝ<br/>
                        <b>USDT:</b> {balanceUSDT.toLocaleString("en")} Ⓣ
                      </p>
                    }
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem onClick={logOut}>Cerrar Sesión</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
  
        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Box>
    );
  }
  
  const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('gray.200', 'gray.700');
  
    return (
      <Stack direction={'row'} spacing={4}>
        {NAV_ITEMS.map((navItem) => (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              {window.location.href.includes(navItem.href) &&
                <PopoverTrigger>
                  <Link
                    p={2}
                    href={navItem.href ?? '#'}
                    fontSize={'sm'}
                    fontWeight={500}
                    rounded={'md'}
                    textDecoration={'none'}
                    color={linkHoverColor}
                    bg={popoverContentBgColor}
                  >
                    {navItem.label}
                  </Link>
                </PopoverTrigger>
              }
              {!window.location.href.includes(navItem.href) &&
                <PopoverTrigger>
                  <Link
                    p={2}
                    href={navItem.href ?? '#'}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={linkColor}
                    rounded={'md'}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                      bg: popoverContentBgColor
                    }}>
                    {navItem.label}
                  </Link>
                </PopoverTrigger>
              }
  
              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={'xl'}
                  minW={'sm'}>
                  <Stack>
                    {navItem.children.map((child) => (
                      <DesktopSubNav key={child.label} {...child} />
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        ))}
      </Stack>
    );
  };
  
  const DesktopSubNav = ({ label, href, subLabel }) => {
    return (
      <Link
        href={href}
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}>
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'pink.400' }}
              fontWeight={500}>
              {label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}>
            <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Link>
    );
  };
  
  const MobileNav = () => {
    return (
      <Stack
        bg={useColorModeValue('white', 'gray.800')}
        p={4}
        display={{ md: 'none' }}>
        {NAV_ITEMS.map((navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} />
        ))}
      </Stack>
    );
  };
  
  const MobileNavItem = ({ label, children, href }) => {
    const { isOpen, onToggle } = useDisclosure();
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('gray.200', 'gray.700');
    
    return (
      <Stack spacing={4} onClick={children && onToggle}>
        <Flex
          py={2}
          as={Link}
          href={href ?? '#'}
          justify={'space-between'}
          align={'center'}
          rounded={'md'}
          _hover={{
            textDecoration: 'none',
            color: linkHoverColor,
            bg: popoverContentBgColor
          }}>

          <Text
            fontWeight={600}
            color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </Flex>
  
        <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
          <Stack
            mt={2}
            pl={4}
            borderLeft={1}
            borderStyle={'solid'}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            align={'start'}>
            {children &&
              children.map((child) => (
                <Link key={child.label} py={2} href={child.href}>
                  {child.label}
                </Link>
              ))}
          </Stack>
        </Collapse>
      </Stack>
    );
  };
  

  const NAV_ITEMS = [
    {
      label: 'Mis Suscripciones',
      href: '/mysubscriptions',
    },
    {
      label: 'Comprar',
      href: '/buysubscriptions',
    },
  ];
  
  // const NAV_ITEMS = [
  //   {
  //     label: 'Inspiration',
  //     children: [
  //       {
  //         label: 'Explore Design Work',
  //         subLabel: 'Trending Design to inspire you',
  //         href: '#',
  //       },
  //       {
  //         label: 'New & Noteworthy',
  //         subLabel: 'Up-and-coming Designers',
  //         href: '#',
  //       },
  //     ],
  //   },
  //   {
  //     label: 'Find Work',
  //     children: [
  //       {
  //         label: 'Job Board',
  //         subLabel: 'Find your dream design job',
  //         href: '#',
  //       },
  //       {
  //         label: 'Freelance Projects',
  //         subLabel: 'An exclusive list for contract work',
  //         href: '#',
  //       },
  //     ],
  //   },
  //   {
  //     label: 'Learn Design',
  //     href: '#',
  //   },
  //   {
  //     label: 'Hire Designers',
  //     href: '#',
  //   },
  // ];