// PaySprint Recharge Handling
import React, { useState, useEffect, useRef } from "react";
import DashboardWrapper from "../../../../hocs/DashboardLayout";
import {
  Box,
  Image,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Stack,
  HStack,
  Flex,
  VStack,
  useToast,
  RadioGroup,
  Radio,
  InputGroup,
  InputLeftAddon,
  useDisclosure,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalFooter,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { HiServerStack } from "react-icons/hi2";
import { GiRotaryPhone, GiMoneyStack } from "react-icons/gi";
import { GoMortarBoard } from "react-icons/go";
import {
  BsCreditCardFill,
  BsLightningChargeFill,
  BsDropletFill,
  BsHouseDoorFill,
  BsEmojiSmileFill,
  BsCheck2Circle,
  BsXCircle,
  BsDownload,
} from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { FiMonitor } from "react-icons/fi";
import {
  FaMobile,
  FaSatelliteDish,
  FaMoneyBillAlt,
  FaUsers,
  FaHeart,
  FaCar,
  FaCity,
} from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import BackendAxios, { ClientAxios, FormAxios } from "../../../../lib/axios";
import Pdf from "react-to-pdf";
import Cookies from "js-cookie";
import Loader from "../../../../hocs/Loader";

const Bbps = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rechargeProvider, setRechargeProvider] = useState("");
  const [keyword, setKeyword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const [operators, setOperators] = useState();
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [selectedOperatorName, setSelectedOperatorName] = useState("");
  const [networkCircle, setNetworkCircle] = useState("");
  const [operatorMenuStatus, setOperatorMenuStatus] = useState(true);

  const [operatorParams, setOperatorParams] = useState();

  const [circleForm, setCircleForm] = useState(false);

  const [hlrResponse, setHlrResponse] = useState([]);

  const [plans, setPlans] = useState();
  const [planCategories, setPlanCategories] = useState([]);
  const [planValues, setPlanValues] = useState([]);

  const [availablePlans, setAvailablePlans] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPlanCategory, setSelectedPlanCategory] = useState();
  const [selectedPlanValue, setSelectedPlanValue] = useState("");
  const [amount, setAmount] = useState(selectedPlan);

  const [fetchBillBtn, setFetchBillBtn] = useState(false);
  const [fetchInfoBtn, setFetchInfoBtn] = useState(false);
  const [isPaymentProgress, setIsPaymentProgress] = useState(false);

  const [mpin, setMpin] = useState("");

  const formRef = useRef();
  const Toast = useToast({ position: "top-right" });

  const handleShare = async () => {
    const myFile = await toBlob(pdfRef.current, { quality: 0.95 });
    const data = {
      files: [
        new File([myFile], "receipt.jpeg", {
          type: myFile.type,
        }),
      ],
      title: "Receipt",
      text: "Receipt",
    };
    try {
      await navigator.share(data);
    } catch (error) {
      console.error("Error sharing:", error?.toString());
      Toast({
        status: "warning",
        description: error?.toString(),
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    ClientAxios.get(`/api/global`)
      .then((res) => {
        setIsLoading(false);
        setRechargeProvider(res.data[0]?.recharge_provider);
        if (!res.data[0].recharge_status) {
          window.location.href("/dashboard/not-available");
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });

    // ClientAxios.get(`/api/organisation`)
    //   .then((res) => {
    //     setIsLoading(false);
    //     if (!res.data.recharge_status) {
    //       window.location.href("/dashboard/not-available");
    //     }
    //   })
    //   .catch((err) => {
    //     setIsLoading(false);
    //     console.log(err);
    //   });
  }, []);

  useEffect(() => {
    fetchOperators("Prepaid");
  }, []);

  function fetchOperators(keyword) {
    setIsLoading(true);
    setOperatorMenuStatus(false);
    setSelectedOperatorId("");
    setSelectedOperatorName("");
    setOperatorParams();
    setCircleForm(false);
    setPlans();
    setSelectedPlanCategory(false);
    setKeyword(keyword);
    BackendAxios.get(`api/paysprint/bbps/mobile-operators/${keyword}`)
      .then((res) => {
        setIsLoading(false);
        setOperators(Object.values(res.data));
        setOperatorMenuStatus(true);
      })
      .catch((err) => {
        setIsLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        Toast({
          status: "error",
          title: "Error Occured",
          description: err.message,
        });
        console.log(err);
      });
  }

  function fetchParams(operator_value) {
    setOperatorParams();
    setCircleForm(false);
    setPlans();
    setSelectedPlanCategory(false);
    let operatorValueArray = operator_value.split("|");
    setSelectedOperatorId(operatorValueArray[0]);
    setSelectedOperatorName(operatorValueArray[1]);
    // BackendAxios.get(`api/paysprint/bbps/mobile-operators/parameter/${operatorValueArray[0]}`).then((res) => {
    //   setOperatorParams(Object.values(res.data))
    //   keyword == "Postpaid" || keyword == "Landline" ? setFetchBillBtn(true) : setFetchBillBtn(false)
    //   keyword == "PREPAID" ? setFetchInfoBtn(true) : setFetchInfoBtn(false)
    // }).catch((err) => {
    //   console.log(err)
    // })
    setOperatorParams(true);
  }

  function browsePlan() {
    setIsLoading(true);
    setSelectedPlanCategory(false);
    setPlans();
    BackendAxios.post(`api/paysprint/bbps/mobile-recharge/browse`, {
      selectedOperatorName,
      networkCircle,
    })
      .then((res) => {
        setIsLoading(false);
        setPlans(res.data);
        setPlanValues(res.data.info);
        setPlanCategories(Object.keys(res.data.info));
      })
      .catch((err) => {
        setIsLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        Toast({
          status: "error",
          title: "No plans found",
          description: err.message,
        });
        setPlans();
      });
  }

  function hlrRequest() {
    setIsLoading(true);
    BackendAxios.get(`api/paysprint/bbps/mobile-recharge/hlr`, {
      selectedOperatorName,
      networkCircle,
    })
      .then((res) => {
        setIsLoading(false);
        if (res.data.status != false) {
          setHlrResponse(res.data);
        } else {
          Toast({
            status: "error",
            title: "We're facing some issues.",
            description: "Please enter details manually",
          });
          setFetchInfoBtn(false);
          setCircleForm(true);
          setHlrResponse();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        Toast({
          status: "error",
          title: "We're facing some issues.",
          description: "Please enter details manually",
        });
        setFetchInfoBtn(false);
        setCircleForm(true);
        setHlrResponse();
      });
  }

  function fetchBill() {
    let formData = new FormData(document.getElementById("psRechargeForm"));
    FormAxios.post("api/eko/bbps/fetch-bill", formData);
  }

  async function doRecharge() {
    event.preventDefault();
    setIsLoading(true);
    setIsPaymentProgress(true);
    let formData = new FormData(document.getElementById("psRechargeForm"));
    var object = {};
    formData.forEach(function (value, key) {
      object[key] = value;
    });
    await BackendAxios.post(
      `api/${rechargeProvider}/bbps/mobile-recharge/do-recharge`,
      {
        ...object,
        mpin: mpin,
        operatorName: selectedOperatorName,
        secondaryOperatorCode: selectedOperatorName
          ?.toLowerCase()
          .includes("airtel")
          ? "AT"
          : selectedOperatorName?.toLowerCase().includes("bsnl")
          ? "BT"
          : selectedOperatorName?.toLowerCase().includes("vodafone")
          ? "VI"
          : selectedOperatorName?.toLowerCase().includes("idea")
          ? "VI"
          : selectedOperatorName?.toLowerCase().includes("jio")
          ? "JIO"
          : "",
      }
    )
      .then((res) => {
        setIsLoading(false);
        setIsPaymentProgress(false);
        setReceipt({
          status: res.data.metadata.status,
          show: true,
          data: res.data.metadata,
        });
      })
      .catch((err) => {
        setIsLoading(false);
        setIsPaymentProgress(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        Toast({
          status: "error",
          title: "Transaction Failed!",
          description:
            err.response.data.message || err.response.data || err.message,
          position: "top-right",
        });
      });
    onClose();
  }

  const pdfRef = React.createRef();
  const [receipt, setReceipt] = useState({
    show: false,
    status: "success",
    data: {},
  });

  return (
    <>
      {isLoading ? <Loader /> : null}
      <DashboardWrapper titleText={"Prepaid Recharge"}>
        <Stack
          w={"full"}
          bg={"white"}
          boxShadow={"md"}
          mt={6}
          rounded={12}
          direction={["column", "row"]}
        >
          {/* <VStack
            w={['full', 'xs']} h={['sm', 'xl']}
            overflowY={['scroll']}
            alignItems={['flex-start']}
            justifyContent={['flex-start']}
            spacing={0} borderRightColor={['unset', '#999']}
            borderBottomColor={['#999', 'unset']}
            borderRight={[0, '1px']} borderBottom={['1px', 0]}
          >
            <Text p={4} pb={2}>Select Category</Text>
            {categories &&
              categories.map((item, key) => {

                return (
                  <Stack w={['full']}
                    px={4} py={[3, 4]}
                    _hover={{ bg: "aqua" }}
                    direction={['row']}
                    spacing={2} key={key} alignItems={'center'}
                    cursor={'pointer'} onClick={() => fetchOperators(item.keyword)}
                  >
                    {
                      item.operator_category_name.includes("Mobile")
                        ? <FaMobile /> :
                        item.operator_category_name.includes("Broadband")
                          ? <HiServerStack /> :
                          item.operator_category_name.includes("Gas") || item.operator_category_name.includes("LPG")
                            ? <AiFillFire /> :
                            item.operator_category_name.includes("DTH")
                              ? <FaSatelliteDish /> :
                              item.operator_category_name.includes("Card")
                                ? <BsCreditCardFill /> :
                                item.operator_category_name.includes("Electricity")
                                  ? <BsLightningChargeFill /> :
                                  item.operator_category_name.includes("Landline")
                                    ? <GiRotaryPhone /> :
                                    item.operator_category_name.includes("Water")
                                      ? <BsDropletFill /> :
                                      item.operator_category_name.includes("Housing") || item.operator_category_name.includes("Rental")
                                        ? <BsHouseDoorFill /> :
                                        item.operator_category_name.includes("Education")
                                          ? <GoMortarBoard /> :
                                          item.operator_category_name.includes("Tax")
                                            ? <BiRupee /> :
                                            item.operator_category_name.includes("Associations")
                                              ? <FaUsers /> :
                                              item.operator_category_name.includes("TV")
                                                ? <FiMonitor /> :
                                                item.operator_category_name.includes("Hospital") || item.operator_category_name.includes("Donation")
                                                  ? <FaHeart /> :
                                                  item.operator_category_name.includes("Insurance")
                                                    ? <BsEmojiSmileFill /> :
                                                    item.operator_category_name.includes("Loan")
                                                      ? <GiMoneyStack /> :
                                                      item.operator_category_name.includes("FASTag")
                                                        ? <FaCar /> :
                                                        item.operator_category_name.includes("Municipal Services")
                                                          ? <FaCity /> :
                                                          item.operator_category_name.includes("Subscription")
                                                            ? <FaMoneyBillAlt /> : null
                    }
                    <Text textTransform={'capitalize'}>{item.operator_category_name}</Text>
                  </Stack>
                )
              })
            }
          </VStack> */}
          <Box
            p={4}
            w={["full", "85%"]}
            h={["auto", "xl"]}
            overflowY={["scroll"]}
          >
            {operators ? (
              <FormControl id={"operator"}>
                <FormLabel>Select Operator</FormLabel>
                <Select
                  name={"operator"}
                  w={["full", "xs"]}
                  onChange={(e) => {
                    fetchParams(e.target.value);
                  }}
                  isDisabled={!operatorMenuStatus}
                  placeholder={"Select Operator"}
                >
                  {operators
                    ?.filter(
                      (operator) =>
                        !operator.name?.toLowerCase().includes("mtnl")
                    )
                    .map((operator) => {
                      return (
                        <option
                          value={`${operator.id}|${operator.name}`}
                          title={operator.name}
                        >
                          {operator.name}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>
            ) : null}

            {operatorParams ? (
              <form action="" method="POST" ref={formRef} id={"psRechargeForm"}>
                <input
                  type="hidden"
                  name="operator"
                  value={selectedOperatorId}
                />
                {operatorParams ? (
                  <>
                    <Stack my={6} direction={["column"]} spacing={6}>
                      <FormControl id={"canumber"} w={["full", "xs"]}>
                        <FormLabel>Enter Number</FormLabel>
                        <Input type={"text"} maxLength={10} name={"canumber"} />
                      </FormControl>
                    </Stack>
                    <Stack
                      my={6}
                      direction={["column"]}
                      spacing={6}
                      w={["full", "xs"]}
                    >
                      <FormControl id="location">
                        <FormLabel>Select Network Circle</FormLabel>
                        <Select
                          name="location"
                          placeholder="Select Circle"
                          onChange={(e) => setNetworkCircle(e.target.value)}
                        >
                          <option value="Andhra Pradesh Mobileangana">
                            Andhra Pradesh Mobileangana
                          </option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar Jharkhand">
                            Bihar Jharkhand
                          </option>
                          <option value="Chennai">Chennai</option>
                          <option value="Delhi NCR">Delhi NCR</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">
                            Himachal Pradesh
                          </option>
                          <option value="Jammu Kashmir">Jammu Kashmir</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Kolkata">Kolkata</option>
                          <option value="Madhya Pradesh Chhattisgarh">
                            Madhya Pradesh Chhattisgarh
                          </option>
                          <option value="Maharashtra Goa">
                            Maharashtra Goa
                          </option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="North East">North East</option>
                          <option value="Orissa">Orissa</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="UP East">UP East</option>
                          <option value="UP West">UP West</option>
                          <option value="West Bengal">West Bengal</option>
                        </Select>
                      </FormControl>
                      <Button
                        onClick={() => browsePlan()}
                        isLoading={isLoading}
                      >
                        Browse Plans
                      </Button>
                    </Stack>
                  </>
                ) : null}

                {plans && (
                  <>
                    <FormLabel mt={6}>Select Plan</FormLabel>
                    <HStack overflowX={"scroll"} py={6}>
                      {planCategories.map((planCategory, key) => {
                        return (
                          <Button
                            rounded={"full"}
                            colorScheme={"twitter"}
                            variant={"outline"}
                            key={key}
                            onClick={() => {
                              setSelectedPlanCategory(true);
                              setAvailablePlans(planValues[planCategory]);
                            }}
                            _focus={{ bg: "facebook.400", color: "white" }}
                          >
                            {planCategory}
                          </Button>
                        );
                      })}
                    </HStack>
                  </>
                )}
                {selectedPlanCategory ? (
                  <>
                    <RadioGroup
                      name="planAmount"
                      p={4}
                      id="planAmount"
                      mb={6}
                      value={amount}
                      onChange={(value) => {
                        setAmount(value);
                      }}
                      w={["full"]}
                      bg={"aqua"}
                      rounded={12}
                    >
                      <VStack w={"full"}>
                        {availablePlans ? (
                          availablePlans.map((plan, key) => {
                            return (
                              <Box
                                p={3}
                                key={key}
                                w={["full"]}
                                bg={"white"}
                                rounded={12}
                                boxShadow={"lg"}
                              >
                                <Radio value={plan.rs} w={"full"}>
                                  <Text fontSize={"xl"} fontWeight={"semibold"}>
                                    ₹ {plan.rs}
                                  </Text>
                                  <Text fontSize={"sm"}>{plan.desc}</Text>
                                </Radio>
                              </Box>
                            );
                          })
                        ) : (
                          <Text>No plans available</Text>
                        )}
                      </VStack>
                    </RadioGroup>

                  </>
                ) : null}
                <FormControl
                  id="amount"
                  name="amount"
                  w={["full", "xs"]}
                  my={6}
                >
                  <FormLabel>or enter custom amount</FormLabel>
                  <InputGroup>
                    <InputLeftAddon children={"₹"} />
                    <Input
                      type={"number"}
                      name={"amount"}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setSelectedPlan("");
                      }}
                    />
                  </InputGroup>
                </FormControl>
                <Button
                  colorScheme={"whatsapp"}
                  onClick={onOpen}
                  isLoading={isLoading}
                >
                  Pay Now
                </Button>

                {fetchBillBtn && (
                  <Button
                    colorScheme={"facebook"}
                    onClick={() => fetchBill()}
                    isLoading={isLoading}
                  >
                    Fetch Bill
                  </Button>
                )}
                {fetchInfoBtn && (
                  <Button
                    colorScheme={"twitter"}
                    onClick={() => hlrRequest()}
                    isLoading={isLoading}
                  >
                    Fetch Info
                  </Button>
                )}
              </form>
            ) : null}
          </Box>
        </Stack>
      </DashboardWrapper>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Transaction</ModalHeader>
          <ModalBody>
            <VStack>
              <Text>Enter MPIN to confirm this transaction</Text>
              <HStack>
                <PinInput onComplete={(value) => setMpin(value)}>
                  <PinInputField bg={"aqua"} />
                  <PinInputField bg={"aqua"} />
                  <PinInputField bg={"aqua"} />
                  <PinInputField bg={"aqua"} />
                </PinInput>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack justifyContent={"flex-end"}>
              <Button
                colorScheme={"twitter"}
                onClick={() => doRecharge()}
                isLoading={isLoading}
              >
                Confirm
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={receipt.show}
        onClose={() => setReceipt({ ...receipt, show: false })}
      >
        <ModalOverlay />
        <ModalContent width={"xs"}>
          <Box ref={pdfRef} style={{ border: "1px solid #999" }}>
            <ModalHeader p={0}>
              <VStack
                w={"full"}
                p={8}
                bg={
                  receipt?.status?.toLowerCase() == "processed" ||
                  receipt?.status?.toLowerCase() == "success" ||
                  receipt?.status == true ||
                  receipt?.status?.toLowerCase() == "processing" ||
                  receipt?.status?.toLowerCase() == "queued"
                    ? "green.500"
                    : "red.500"
                }
              >
                {receipt?.status?.toLowerCase() == "processed" ||
                receipt?.status == true ||
                receipt?.status?.toLowerCase() == "success" ||
                receipt?.status?.toLowerCase() == "processing" ||
                receipt?.status?.toLowerCase() == "queued" ? (
                  <BsCheck2Circle color="#FFF" fontSize={72} />
                ) : (
                  <BsXCircle color="#FFF" fontSize={72} />
                )}
                <Text color={"#FFF"} textTransform={"capitalize"}>
                  ₹ {receipt.data.amount || 0}
                </Text>
                <Text
                  color={"#FFF"}
                  fontSize={"sm"}
                  textTransform={"uppercase"}
                >
                  TRANSACTION{" "}
                  {receipt?.status?.toLowerCase() == "processing" ||
                  receipt?.status?.toLowerCase() == "queued" ||
                  receipt?.status?.toLowerCase() == "processed" ||
                  receipt?.status?.toLowerCase() == "success" ||
                  receipt?.status == true
                    ? "SUCCESSFUL"
                    : "FAILED"}
                </Text>
              </VStack>
            </ModalHeader>
            <ModalBody p={0} bg={"azure"}>
              <VStack w={"full"} spacing={0} p={4} bg={"#FFF"}>
                {receipt.data
                  ? Object.entries(receipt.data).map((item, key) => {
                      if (
                        item[0].toLowerCase() != "status" &&
                        item[0].toLowerCase() != "user" &&
                        item[0].toLowerCase() != "user_id" &&
                        item[0].toLowerCase() != "user_phone" &&
                        item[0].toLowerCase() != "amount"
                      )
                        return (
                          <HStack
                            justifyContent={"space-between"}
                            gap={8}
                            pb={1}
                            w={"full"}
                            key={key}
                            borderWidth={"0.75px"}
                            p={2}
                          >
                            <Text
                              fontSize={"xs"}
                              fontWeight={"medium"}
                              textTransform={"capitalize"}
                            >
                              {item[0].replace(/_/g, " ")}
                            </Text>
                            <Text
                              fontSize={"xs"}
                              maxW={"full"}
                            >{`${item[1]}`}</Text>
                          </HStack>
                        );
                    })
                  : null}
              </VStack>
            </ModalBody>
          </Box>
          <ModalFooter>
            <HStack justifyContent={"center"} gap={4}>
              <Button
                colorScheme="yellow"
                size={"sm"}
                rounded={"full"}
                onClick={handleShare}
              >
                Share
              </Button>
              <Pdf targetRef={pdfRef} filename="Receipt.pdf">
                {({ toPdf }) => (
                  <Button
                    rounded={"full"}
                    size={"sm"}
                    colorScheme={"twitter"}
                    leftIcon={<BsDownload />}
                    onClick={toPdf}
                  >
                    Download
                  </Button>
                )}
              </Pdf>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Bbps;