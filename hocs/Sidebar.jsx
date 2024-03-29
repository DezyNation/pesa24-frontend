import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Box,
  HStack,
  VStack,
  Image,
  Text,
  Hide,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Avatar,
} from "@chakra-ui/react";
import { BiRupee, BiUser, BiPowerOff, BiHomeAlt } from "react-icons/bi";
import { VscDashboard } from "react-icons/vsc";
import { IoMdHelpBuoy } from "react-icons/io";
import BackendAxios, { ClientAxios } from "../lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { BsFileEarmarkBarGraph, BsBank, BsPeopleFill } from "react-icons/bs";
import { GiReceiveMoney } from 'react-icons/gi'
import { FaShare } from 'react-icons/fa'
import BankDetails from "./BankDetails";


export const SidebarOptions =
  [
    {
      type: 'accordion',
      title: 'profile',
      icon: <BiUser />,
      children: [
        {
          title: 'view profile',
          link: '/dashboard/profile?pageId=profile',
          id: "viewProfile",
          soon: false,
        },
        {
          title: 'edit profile',
          link: '/dashboard/profile/edit?pageId=profile',
          id: "editProfile",
          soon: false,
        },
        {
          title: 'reset MPIN',
          link: '/dashboard/profile/reset-mpin?pageId=profile',
          id: "resetMpin",
          soon: false,
        },
        {
          title: 'reset password',
          link: '/dashboard/profile/reset-password?pageId=profile',
          id: "resetPassword",
          soon: false,
        },
      ]
    },
    {
      type: 'link',
      title: 'home',
      icon: <BiHomeAlt />,
      link: '/dashboard/home?pageId=home',
    },
    {
      type: 'link',
      title: 'dashboard',
      icon: <VscDashboard />,
      link: '/dashboard?pageId=dashboard',
    },
    {
      type: 'accordion',
      title: 'services',
      icon: <BiRupee />,
      children: [
        {
          title: 'Activate services',
          link: '/dashboard/services/activate?pageId=services',
          id: "basicServiceActivate",
          soon: false,
        },
        {
          title: 'AePS services',
          link: '/dashboard/services/aeps?pageId=services',
          id: "aepsTransaction",
          soon: false
        },
        {
          title: 'Aadhaar Pay',
          link: '/dashboard/services/aeps/pay?pageId=services',
          id: "aepsAadhaarPay",
          soon: false
        },
        {
          title: 'DMT services',
          link: '/dashboard/services/dmt?pageId=services',
          id: "dmtTransaction",
          soon: false,
        },
        {
          title: 'BBPS services',
          link: '/dashboard/services/bbps?pageId=services',
          id: "bbpsTransaction",
          soon: false,
        },
        {
          title: 'recharge',
          link: '/dashboard/services/recharge?pageId=services',
          id: "rechargeTransaction",
          soon: false,
        },
        {
          title: 'Payout',
          link: '/dashboard/services/payout?pageId=services',
          id: "payoutTransaction",
          soon: false,
        },
        {
          title: 'axis bank account',
          link: '/dashboard/services/axis?pageId=services',
          id: "axisTransaction",
          soon: false,
        },
        {
          title: 'LIC services',
          link: '/dashboard/services/lic?pageId=services',
          id: "licTransaction",
          soon: false,
        },
        {
          title: 'PAN services',
          link: '/dashboard/services/pan?pageId=services',
          id: "panTransaction",
          soon: false,
        },
        {
          title: 'CMS services',
          link: '/dashboard/services/cms?pageId=services',
          id: "cmsTransaction",
          soon: false,
        },
        {
          title: 'Fastag',
          link: '/dashboard/services/fastag?pageId=services',
          id: "fastagTransaction",
          soon: false,
        },
      ]
    },
    {
      type: 'link',
      title: 'fund request',
      id: 'request',
      icon: <GiReceiveMoney />,
      link: '/dashboard/fund-request?pageId=request',
    },
    {
      type: 'link',
      title: 'wallet transfer',
      id: 'transfer',
      icon: <FaShare />,
      link: '/dashboard/fund-transfer?pageId=transfer',
    },
    {
      type: 'link',
      title: 'fund settlement',
      id: 'settlement',
      icon: <BsBank />,
      link: '/dashboard/fund-settlement?pageId=settlement',
    },
    {
      type: 'accordion',
      title: 'reports',
      id: 'reports',
      icon: <BsFileEarmarkBarGraph />,
      children: [
        {
          title: 'AePS reports',
          link: '/dashboard/reports/aeps?pageId=reports',
          id: "aepsReport",
          soon: false,
        },
        {
          title: 'BBPS reports',
          link: '/dashboard/reports/bbps?pageId=reports',
          id: "bbpsReport",
          soon: false,
        },
        {
          title: 'recharge reports',
          link: '/dashboard/reports/recharge?pageId=reports',
          id: "rechargeReport",
          soon: false,
        },
        {
          title: 'DMT reports',
          link: '/dashboard/reports/dmt?pageId=reports',
          id: "dmtReport",
          soon: false,
        },
        {
          title: 'Payout reports',
          link: '/dashboard/reports/payout?pageId=reports',
          id: "payoutReport",
          soon: false,
        },
        {
          title: 'fund requests',
          link: '/dashboard/reports/fund-requests?pageId=reports',
          id: "basicFundRequesReport",
          soon: false,
        },
        {
          title: 'wallet transfers',
          link: '/dashboard/reports/fund-transfers?pageId=reports',
          id: "basicFundRequesReport",
          soon: false,
        },
        // {
        //   title: 'fund transfers',
        //   link: '/dashboard/reports/fund-transfers?pageId=reports',
        //   id: "basicFundTransferReport",
        //   soon: true,
        // },
        {
          title: 'LIC reports',
          link: '/dashboard/reports/lic?pageId=reports',
          id: "licReport",
          soon: false,
        },
        {
          title: 'PAN reports',
          link: '/dashboard/reports/pan?pageId=reports',
          id: "panReport",
          soon: false,
        },
        {
          title: 'CMS reports',
          link: '/dashboard/reports/cms?pageId=reports',
          id: "cmsReport",
          soon: false,
        },
        // {
        //   title: 'axis accounts',
        //   link: '/dashboard/reports/axis?pageId=reports',
        //   id: "axisReport",
        //   soon: true,
        // },
        {
          title: 'fastag reports',
          link: '/dashboard/reports/fastag?pageId=reports',
          id: "fastagReport",
          soon: false,
        },
        {
          title: 'Transaction Ledger',
          link: '/dashboard/reports/transactions/ledger?pageId=reports',
          id: "basicTransactionLedger",
          soon: false,
        },
        {
          title: 'Daily Sales',
          link: '/dashboard/reports/transactions/daily?pageId=reports',
          id: "basicDailySales",
          soon: false,
        },
      ]
    },
    {
      type: 'link',
      title: 'support tickets',
      id: 'support',
      icon: <IoMdHelpBuoy />,
      link: '/dashboard/support-tickets?pageId=support',
    },
  ]

const Sidebar = ({ userName, userImage }) => {
  const alwaysAvailable = ['viewProfile', 'editProfile', 'resetMpin', 'resetPassword']
  const [availablePages, setAvailablePages] = useState(['activate'])
  const [servicesLoading, setServicesLoading] = useState(false)
  const Router = useRouter()
  const { pageId } = Router.query
  const [userType, setUserType] = useState("")

  useEffect(() => {
    const activePage = typeof window !== 'undefined' ? document.getElementById(pageId) : document.getElementById("dashboard")
    if (activePage) {
      activePage.style.background = "#3C79F5"
      activePage.style.color = "#FFF"
    }

    setUserType(localStorage.getItem("userType"))
  }, [])

  function signout() {
    BackendAxios.post("/logout").then(() => {
      Cookies.remove("verified")
      Router.push("/auth/login")
    }).catch(() => {
      Cookies.remove("verified")
      Router.push("/auth/login")
    }).finally(() => {
      Router.push("/auth/login")
    })
  }

  useEffect(() => {
    setServicesLoading(true)
    ClientAxios.post('/api/user/fetch', {
      user_id: localStorage.getItem('userId')
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      setAvailablePages(res.data[0].allowed_pages)
      setServicesLoading(false)
    }).catch((err) => {
      console.log(err)
      setServicesLoading(false)
    })
  }, [])

  return (
    <>
      <Hide below={"md"}>
        <VStack
          className={"sidebar"}
          w={"64"}
          boxShadow={"md"}
          h={"100vh"}
          bgColor={'purple.400'}
          bgImage={'/sidebarBg.svg'}
          bgSize={'cover'}
          bgRepeat={'no-repeat'}
          p={4} color={'#FFF'}
          rounded={"12"}
          border={"1px"}
          borderColor={"gray.300"}
          overflowY={"scroll"}
        >
          <Link href={"/dashboard/profile?pageId=profile"}>
            <VStack spacing={2}>
              <Avatar name={userName} src={userImage} size={'xl'} />
              <Text fontSize={"xl"} textAlign={'center'}>{userName}</Text>
              <Text
                fontSize={"sm"}
                color={"#FAFAFA"}
                textTransform={'capitalize'}
              >{userType?.replace("_", " ")}</Text>
            </VStack>
          </Link>


          <VStack pt={8} w={"full"} spacing={4}>
            {
              SidebarOptions.map((option, key) => {
                if (option.type == 'link') {
                  return (
                    <Link href={option.link} key={key} style={{ width: "100%" }}>
                      <HStack
                        px={3}
                        py={2}
                        rounded={'full'}
                        overflow={'hidden'}
                        bgColor={Router.asPath.includes(`pageId=${option.id}`) ? 'twitter.800' : 'transparent'}
                        id={option.id || option.title}
                      >
                        {option.icon}
                        <Text textTransform={'capitalize'}>{option.title}</Text>
                      </HStack>
                    </Link>
                  )
                }

                if (option.type == 'accordion') {
                  return (
                    <Accordion allowToggle w={'full'} key={key}>

                      <AccordionItem border={'none'}>
                        <AccordionButton
                          px={[0, 3]} py={2}
                          bgColor={Router.asPath.includes(`pageId=${option.id}`) ? 'twitter.800' : 'transparent'}
                          rounded={'full'}>
                          <HStack
                            spacing={1} flex={1}
                            fontSize={['1.2rem', 'md']}
                            alignItems={'center'}
                          >
                            {option.icon}
                            <Text textTransform={'capitalize'}>{option.title}</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel px={0}>


                          <VStack
                            w={'full'}
                            alignItems={'flex-start'}
                            justifyContent={'flex-start'}
                            spacing={2}
                            overflow={'hidden'}
                            id={'payout'}
                          >
                            {
                              servicesLoading ? <Text fontSize={'xs'} color={'aqua'}>Loading services...</Text> : null
                            }

                            {option.children.map((item, key) => {
                              if (availablePages.includes(item.id) || alwaysAvailable.includes(item.id)) {
                                return (
                                  <Box
                                    px={3} py={2} w={'full'} key={key} 

                                  >
                                    <Link href={item.soon ? "#" : item.link}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        gap: '4px'
                                      }}>
                                      <Text
                                        textAlign={'left'}
                                        textTransform={'capitalize'}
                                      >{item.title}</Text>
                                      {
                                        item.soon &&
                                        <Text fontSize={8} p={1} bg={'yellow.100'} color={'yellow.900'}>Coming Soon</Text>
                                      }
                                    </Link>
                                  </Box>
                                )
                              }
                            })}
                          </VStack>

                        </AccordionPanel>

                      </AccordionItem>

                    </Accordion>
                  )

                }
              })
            }

            {
              userType != "retailer" &&
              <Accordion allowToggle w={'full'}>

                <AccordionItem border={'none'}>
                  <AccordionButton px={[0, 3]}
                    id={'users'}
                  >
                    <HStack spacing={1} flex={1} fontSize={['1.2rem', 'md']} alignItems={'center'}>
                      <BsPeopleFill />
                      <Text textTransform={'capitalize'}>Manage Users</Text>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel px={0}>

                    <VStack
                      w={'full'}
                      alignItems={'flex-start'}
                      justifyContent={'flex-start'}
                      spacing={2}
                      overflow={'hidden'}
                    >
                      {
                        availablePages.includes('userManagementCreateUser') ?
                          <Link href={"/dashboard/users/create-user?pageId=users"} style={{ width: '100%' }}>
                            <Text
                              w={'full'} textAlign={'left'}
                              px={3} py={2}
                              textTransform={'capitalize'}
                            >Create User</Text>
                          </Link> : null
                      }

                      {
                        availablePages.includes('userManagementUsersList') ?
                          <Link href={"/dashboard/users/view-users?pageId=users"} style={{ width: '100%' }}>
                            <Text
                              w={'full'} textAlign={'left'}
                              px={3} py={2}
                              textTransform={'capitalize'}
                            >View Users</Text>
                          </Link> : null
                      }

                      {
                        availablePages.includes('userManagementUserLedger') ?
                          <Link href={"/dashboard/users/user-ledger?pageId=users"} style={{ width: '100%' }}>
                            <Text
                              w={'full'} textAlign={'left'}
                              px={3} py={2}
                              textTransform={'capitalize'}
                            >User Ledger</Text>
                          </Link> : null
                      }

                    </VStack>

                  </AccordionPanel>

                </AccordionItem>

              </Accordion>
            }


            <HStack
              spacing={2}
              w={"full"}
              borderRadius={"full"}
              px={3}
              py={2}
              bg={'red.400'}
              color={"white"}
              onClick={signout}
              cursor={'pointer'}
            >
              <BiPowerOff />
              <Text>Sign Out</Text>
            </HStack>

            <BankDetails color={'#FFF'} />
          </VStack>
        </VStack>
      </Hide>
    </>
  );
};

export default Sidebar;
