import React, { useEffect, useState } from "react";
import DashboardWrapper from "../../../../hocs/DashboardLayout";
import {
  useToast,
  Box,
  Text,
  Image,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  VStack,
  VisuallyHidden,
  FormControl,
  FormLabel,
  Input,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr, Th, Td,
  
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  BsCheck2Circle,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
  BsXCircle,
  BsEye,
} from "react-icons/bs";
import BackendAxios from "../../../../lib/axios";
import Pdf from "react-to-pdf";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toBlob } from "html-to-image";
import Cookies from "js-cookie";
import { useFormik } from "formik";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const Index = () => {
  const Toast = useToast({
    position: "top-right",
  });
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [printableRow, setPrintableRow] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Trnxn ID",
      field: "transaction_id",
      width: 150,
    },
    {
      headerName: "Debit",
      field: "debit_amount",
      cellRenderer: "debitCellRenderer",
      width: 150,
    },
    {
      headerName: "Credit",
      field: "credit_amount",
      cellRenderer: "creditCellRenderer",
      width: 150,
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
      width: 150,
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
      width: 150,
    },
    {
      headerName: "Trnxn Type",
      field: "service_type",
      width: 100,
    },
    {
      headerName: "Trnxn Status",
      field: "status",
      cellRenderer: "statusCellRenderer",
      width: 100,
    },
    {
      headerName: "Created At",
      field: "created_at",
      width: 150,
    },
    {
      headerName: "Updated At",
      field: "updated_at",
      width: 150,
    },
    {
      headerName: "Additional Info",
      field: "metadata",
      hide: true,
    },
    {
      headerName: "Receipt",
      field: "receipt",
      pinned: "right",
      cellRenderer: "receiptCellRenderer",
      width: 80,
    },
  ]);
  const [overviewData, setOverviewData] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
    },
  });

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

  function fetchSum() {
    // Fetch transactions overview
    BackendAxios.get(
      `/api/user/overview?from=${
        Formik.values.from + (Formik.values.from && "T" + "00:00")
      }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}`
    )
      .then((res) => {
        setOverviewData(res.data);
      })
      .catch((err) => {
        console.log(err);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
      });
  }

  // function fetchTransactions(pageLink) {
  //   BackendAxios.get(pageLink || `/api/user/daily-sales?page=1`)
  //     .then((res) => {
  //       setPagination({
  //         current_page: res.data.current_page,
  //         total_pages: parseInt(res.data.last_page),
  //         first_page_url: res.data.first_page_url,
  //         last_page_url: res.data.last_page_url,
  //         next_page_url: res.data.next_page_url,
  //         prev_page_url: res.data.prev_page_url,
  //       });
  //       setPrintableRow(res?.data?.data);
  //       setRowData(res?.data?.data);
  //       fetchSum();
  //     })
  //     .catch((err) => {
  //       if (err?.response?.status == 401) {
  //         Cookies.remove("verified");
  //         window.location.reload();
  //         return;
  //       }
  //       console.log(err);
  //       Toast({
  //         status: "error",
  //         description:
  //           err.response.data.message || err.response.data || err.message,
  //       });
  //     });
  // }

  useEffect(() => {
    // fetchTransactions();
    fetchSum();
  }, []);

  const pdfRef = React.createRef();
  const [receipt, setReceipt] = useState({
    show: false,
    status: "success",
    data: {},
  });
  const receiptCellRenderer = (params) => {
    function showReceipt() {
      if (!params.data.metadata) {
        Toast({
          description: "No Receipt Available",
        });
        return;
      }
      setReceipt({
        status: JSON.parse(params.data.metadata).status,
        show: true,
        data: JSON.parse(params.data.metadata),
      });
    }
    return (
      <HStack height={'full'} w={'full'} gap={4}>
        <Button rounded={'full'} colorScheme='twitter' size={'xs'} onClick={() => showReceipt()}><BsEye /></Button>
      </HStack>
    );
  };

  const creditCellRenderer = (params) => {
    return (
      <Text
        px={1}
        flex={"unset"}
        w={"fit-content"}
        fontWeight={"semibold"}
        color={params.value > 0 && "green.400"}
      >
        {params.value}
      </Text>
    );
  };

  const debitCellRenderer = (params) => {
    return (
      <Text
        px={1}
        flex={"unset"}
        w={"fit-content"}
        fontWeight={"semibold"}
        color={params.value > 0 && "red.400"}
      >
        {params.value}
      </Text>
    );
  };

  const statusCellRenderer = (params) => {
    return (
      <>
        {JSON.parse(params.data.metadata).status ? (
          <Text color={"green"} fontWeight={"bold"}>
            SUCCESS
          </Text>
        ) : (
          <Text color={"red"} fontWeight={"bold"}>
            FAILED
          </Text>
        )}
      </>
    );
  };

  const tableRef = React.useRef(null);
  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
    setUserName(localStorage.getItem("userName"));
  }, []);

  return (
    <>
      <DashboardWrapper pageTitle={"Daily Sales"}>
        <HStack justifyContent={"flex-start"} py={4}>
          <FormControl w={["full", "xs"]}>
            <FormLabel>From</FormLabel>
            <Input
              type="date"
              bgColor={"#FFF"}
              name="from"
              onChange={Formik.handleChange}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>To</FormLabel>
            <Input
              type="date"
              bgColor={"#FFF"}
              name="to"
              onChange={Formik.handleChange}
            />
          </FormControl>
        </HStack>
        <HStack justifyContent={"flex-end"}>
          <Button
            colorScheme="twitter"
            onClick={() => {
              fetchSum();
            }}
          >
            Search
          </Button>
        </HStack>
        {/* <HStack spacing={2} py={4} mt={24} bg={'white'} justifyContent={'center'}>
          <Button
            colorScheme={'twitter'}
            fontSize={12} size={'xs'}
            variant={'outline'}
            onClick={() => fetchTransactions(pagination.first_page_url)}
          ><BsChevronDoubleLeft />
          </Button>
          <Button
            colorScheme={'twitter'}
            fontSize={12} size={'xs'}
            variant={'outline'}
            onClick={() => fetchTransactions(pagination.prev_page_url)}
          ><BsChevronLeft />
          </Button>
          <Button
            colorScheme={'twitter'}
            fontSize={12} size={'xs'}
            variant={'solid'}
          >{pagination.current_page}</Button>
          <Button
            colorScheme={'twitter'}
            fontSize={12} size={'xs'}
            variant={'outline'}
            onClick={() => fetchTransactions(pagination.next_page_url)}
          ><BsChevronRight />
          </Button>
          <Button
            colorScheme={'twitter'}
            fontSize={12} size={'xs'}
            variant={'outline'}
            onClick={() => fetchTransactions(pagination.last_page_url)}
          ><BsChevronDoubleRight />
          </Button>
        </HStack>
        <Box py={6}>
          <Box className='ag-theme-alpine ag-theme-pesa24-blue' rounded={16} overflow={'hidden'} w={'full'} h={['2xl']}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{
                filter: true,
                floatingFilter: true,
                resizable: true,
                sortable: true,
              }}
              components={{
                'receiptCellRenderer': receiptCellRenderer,
                'creditCellRenderer': creditCellRenderer,
                'debitCellRenderer': debitCellRenderer,
                'statusCellRenderer': statusCellRenderer
              }}

              onFilterChanged={
                (params) => {
                  setPrintableRow(params.api.getRenderedNodes().map((item) => {
                    return (
                      item.data
                    )
                  }))
                }
              }
            >

            </AgGridReact>
          </Box>
        </Box> */}
        <br />
        <br />
        <TableContainer rounded={16}>
          <Table
            colorScheme="twitter"
            variant={"striped"}
            ref={tableRef}
            id="printable-table"
          >
            <Thead bgColor={"twitter.500"} color={"#FFF"}>
              <Tr>
                <Th color={"#FFF"} rowSpan={2}>
                  User Info
                </Th>
                <Th color={"#FFF"}>Payout</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Reharge</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>AePS CW</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>AePS Payout</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>Bill Pay</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>DMT</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>LIC</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
                <Th color={"#FFF"}>Fastag</Th>
                <Th color={"#FFF"}>Charge</Th>
                <Th color={"#FFF"}>Comm.</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Box>
                    <Text fontSize={"lg"} fontWeight={"semibold"}>
                      ({userId}) - {userName}
                    </Text>
                  </Box>
                </Td>
                {/* <Td>₹ {item?.userWallet || 0}</Td> */}
                <Td>
                  {Math.abs(
                    overviewData[4]?.["payout"]?.credit -
                      overviewData[4]?.["payout"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                    overviewData[11]?.["payout-commission"]?.credit +
                      overviewData[10]?.["payout-charge"]?.credit -
                      (overviewData[11]?.["payout-commission"]?.debit +
                        overviewData[10]?.["payout-charge"]?.debit)
                  ).toFixed(2) || 0}
                </Td>
                <Td>
                  {Math.abs(
                    overviewData[8]?.["recharge"]?.credit -
                      overviewData[8]?.["recharge"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["recharge-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["recharge-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-cw"]?.credit -
                      overviewData[12]?.["aeps-cw"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-cw-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-cw-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-pay"]?.credit -
                      overviewData[12]?.["aeps-pay"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-pay-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["aeps-pay-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["bbps"]?.credit -
                      overviewData[12]?.["bbps"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["bbps-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["bbps-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["dmt"]?.credit -
                      overviewData[12]?.["dmt"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["dmt-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["dmt-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["lic"]?.credit -
                      overviewData[12]?.["lic"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["lic-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["lic-commission"]?.credit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["fastag"]?.credit -
                      overviewData[12]?.["fastag"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["fastag-commission"]?.debit
                  ) || 0}
                </Td>
                <Td>
                  {Math.abs(
                      overviewData[12]?.["fastag-commission"]?.credit
                  ) || 0}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </DashboardWrapper>

      {/* Receipt */}
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
                bg={receipt.status ? "green.500" : "red.500"}
              >
                {receipt.status ? (
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
                  TRANSACTION {receipt.status ? "success" : "failed"}
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

      {/* <VisuallyHidden>
        <table id='printable-table'>
          <thead>
            <tr>
              <th>#</th>
              {
                columnDefs.filter((column) => {
                  if (
                    column.field != "metadata" &&
                    column.field != "name" &&
                    column.field != "receipt"
                  ) {
                    return (
                      column
                    )
                  }
                }).map((column, key) => {
                  return (
                    <th key={key}>{column.headerName}</th>
                  )
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              printableRow.map((data, key) => {
                return (
                  <tr key={key}>
                    <td>{key + 1}</td>
                    <td>{data.transaction_id}</td>
                    <td>{data.debit_amount}</td>
                    <td>{data.credit_amount}</td>
                    <td>{data.opening_balance}</td>
                    <td>{data.closing_balance}</td>
                    <td>{data.service_type}</td>
                    <td>{JSON.parse(data.metadata).status ? "SUCCESS" : "FAILED"}</td>
                    <td>{data.created_at}</td>
                    <td>{data.updated_at}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </VisuallyHidden> */}
    </>
  );
};

export default Index;
