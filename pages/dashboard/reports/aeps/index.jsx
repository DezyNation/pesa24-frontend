import React, { useEffect, useState } from "react";
import DashboardWrapper from "../../../../hocs/DashboardLayout";
import {
  useToast,
  Box,
  Text,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  VStack,
  Image,
  VisuallyHidden,
  Stack,
  FormControl,
  FormLabel,
  Input,
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
import { useFormik } from "formik";
import Cookies from "js-cookie";
import fileDownload from "js-file-download";
import { FiRefreshCcw } from "react-icons/fi";

function StatementTable({ ministatement }) {
  if (typeof ministatement == Array && ministatement.length === 0) {
    return (
      <p style={{ fontSize: "8px", color: "darkslategray" }}>
        No mini statement to show.
      </p>
    );
  }

  if (typeof ministatement != Array) {
    return (
      <p style={{ fontSize: "8px", color: "darkslategray" }}>
        No mini statement to show.
      </p>
    );
  }

  const tableHeaders = Object.keys(ministatement[0]);

  return (
    <table
      style={{ fontSize: "8px", borderCollapse: "collapse", width: "100%" }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          {tableHeaders.map((header) => (
            <th
              key={header}
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ministatement.map((item, index) => (
          <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
            {tableHeaders.map((header) => (
              <td key={header} style={{ padding: "8px" }}>
                {item[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const Index = () => {
  const transactionKeyword = "aeps";
  const Toast = useToast({
    position: "top-right",
  });
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
    },
    {
      headerName: "Aadhaar No.",
      field: "metadata",
      cellRenderer: "aadhaarCellRenderer"
    },
    {
      headerName: "Debit Amount",
      field: "debit_amount",
      cellRenderer: "debitCellRenderer",
    },
    {
      headerName: "Credit Amount",
      field: "credit_amount",
      cellRenderer: "creditCellRenderer",
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
    },
    {
      headerName: "Transaction Type",
      field: "service_type",
    },
    {
      headerName: "Transaction Status",
      field: "status",
      cellRenderer: "statusCellRenderer",
    },
    {
      headerName: "Created Timestamp",
      field: "created_at",
    },
    {
      headerName: "Updated Timestamp",
      field: "updated_at",
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
  const [printableRow, setPrintableRow] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

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

  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      search: "",
    },
  });

  function generateReport(doctype) {
    if (!Formik.values.from || !Formik.values.to) {
      Toast({
        description: "Please select dates to generate report",
      });
      return;
    }
    setReportLoading(true);
    BackendAxios.get(
      `/api/user/print-reports?from=${
        Formik.values.from + (Formik.values.from && "T" + "00:00")
      }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}&search=${
        Formik.values.search
      }&type=ledger&name=${transactionKeyword}&doctype=${doctype}`,
      {
        responseType: "blob",
      }
    )
      .then((res) => {
        setReportLoading(false);
        if (doctype == "excel") {
          fileDownload(res.data, "AepsReport.xlsx");
        } else {
          fileDownload(res.data, "AepsReport.pdf");
        }
      })
      .catch((err) => {
        setReportLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        console.log(err);
        Toast({
          status: "error",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  function fetchTransactions(pageLink) {
    setLoading(true);
    BackendAxios.get(
      pageLink ||
        `/api/user/ledger/${transactionKeyword}?from=${
          Formik.values.from + (Formik.values.from && "T" + "00:00")
        }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}&search=${
          Formik.values.search
        }&page=1`
    )
      .then((res) => {
        setLoading(false);
        setPagination({
          current_page: res.data.current_page,
          total_pages: parseInt(res.data.last_page),
          first_page_url: res.data.first_page_url,
          last_page_url: res.data.last_page_url,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });
        setRowData(res.data.data);
        // setPrintableRow(res.data.data)
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
          return;
        }
        Toast({
          status: "error",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  useEffect(() => {
    fetchTransactions();
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
      <HStack height={"full"} w={"full"} gap={4}>
        <Button
          rounded={"full"}
          colorScheme="twitter"
          size={"xs"}
          onClick={() => showReceipt()}
        >
          <BsEye />
        </Button>
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

  const aadhaarCellRenderer = (params) => {
    return(
      <Text>{JSON.parse(params.data.metadata)?.aadhaar_number}</Text>
    )
  }

  return (
    <>
      <DashboardWrapper pageTitle={"AePS Reports"}>
        <HStack>
          <Button
            onClick={() => generateReport("pdf")}
            colorScheme={"red"}
            size={"sm"}
            isLoading={reportLoading}
          >
            Export PDF
          </Button>
          <Button
            onClick={() => generateReport("excel")}
            colorScheme={"whatsapp"}
            size={"sm"}
            isLoading={reportLoading}
          >
            Excel
          </Button>
        </HStack>

        <Stack p={4} spacing={8} w={"full"} direction={["column", "row"]}>
          <FormControl w={["full", "xs"]}>
            <FormLabel>From Date</FormLabel>
            <Input
              name="from"
              onChange={Formik.handleChange}
              type="date"
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>To Date</FormLabel>
            <Input
              name="to"
              onChange={Formik.handleChange}
              type="date"
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>Ref ID or Aadhaar No.</FormLabel>
            <Input
              name="search"
              onChange={Formik.handleChange}
              bg={"white"}
            />
          </FormControl>
        </Stack>
        <HStack mb={4} justifyContent={"flex-end"}>
          <Button onClick={() => fetchTransactions()} colorScheme={"twitter"}>
            Search
          </Button>
        </HStack>
        
        
        <HStack
          spacing={2}
          p={4}
          mt={24}
          bg={"white"}
          justifyContent={"space-between"}
        >
          <HStack spacing={2}>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchTransactions(pagination.first_page_url)}
            >
              <BsChevronDoubleLeft />
            </Button>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchTransactions(pagination.prev_page_url)}
            >
              <BsChevronLeft />
            </Button>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"solid"}
            >
              {pagination.current_page}
            </Button>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchTransactions(pagination.next_page_url)}
            >
              <BsChevronRight />
            </Button>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchTransactions(pagination.last_page_url)}
            >
              <BsChevronDoubleRight />
            </Button>
          </HStack>
          <Button
            colorScheme="blue"
            isLoading={loading}
            variant={"ghost"}
            onClick={() => fetchTransactions()}
            leftIcon={<FiRefreshCcw />}
          >
            Click To Reload Data
          </Button>
        </HStack>

        <Box py={6}>
          <Box
            className="ag-theme-alpine ag-theme-pesa24-blue"
            rounded={16}
            overflow={"hidden"}
            w={"full"}
            h={["2xl"]}
          >
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
                receiptCellRenderer: receiptCellRenderer,
                creditCellRenderer: creditCellRenderer,
                debitCellRenderer: debitCellRenderer,
                statusCellRenderer: statusCellRenderer,
                aadhaarCellRenderer: aadhaarCellRenderer
              }}
              onFilterChanged={(params) => {
                setPrintableRow(
                  params.api.getRenderedNodes().map((item) => {
                    return item.data;
                  })
                );
              }}
            ></AgGridReact>
          </Box>
        </Box>
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
                <Text
                  color={"#FFF"}
                  fontSize={"xs"}
                  textTransform={"uppercase"}
                >
                  Transaction {receipt.status ? "success" : "failed"}
                </Text>
              </VStack>
            </ModalHeader>
            <ModalBody p={0} bg={"azure"}>
              <VStack w={"full"} spacing={0} p={4} bg={"#FFF"}>
                {receipt.data
                  ? Object.entries(receipt.data).map((item, key) => {
                      //if (aepsProvider == 'eko')
                      if (
                        item[0].toLowerCase() != "status" &&
                        item[0].toLowerCase() != "customer_balance" &&
                        item[0].toLowerCase() != "user_name" &&
                        item[0].toLowerCase() != "user_id" &&
                        item[0].toLowerCase() != "amount" &&
                        item[0].toLowerCase() != "ministatement" &&
                        item[0].toLowerCase() != "user_phone"
                      ) {
                        return (
                          <HStack
                            justifyContent={"space-between"}
                            gap={8}
                            pb={1}
                            w={"full"}
                            key={key}
                            p={2}
                            borderWidth={"1px"}
                          >
                            <Text
                              fontSize={"xs"}
                              fontWeight={"medium"}
                              textTransform={"capitalize"}
                            >
                              {item[0].replace(/_/g, " ")}
                            </Text>
                            <Text fontSize={"xs"}>{`${item[1]}`}</Text>
                          </HStack>
                        );
                      }
                    })
                  : null}
                {receipt.status ? (
                  <StatementTable
                    ministatement={receipt.data?.ministatement || [{}]}
                  />
                ) : null}
                <VStack pt={8} w={"full"} spacing={0}>
                  <HStack
                    borderWidth={"1px"}
                    pb={1}
                    justifyContent={"space-between"}
                    w={"full"}
                  >
                    <Text fontSize={"xs"} fontWeight={"semibold"}>
                      Merchant:
                    </Text>
                    <Text fontSize={"xs"}>{receipt.data.user_name}</Text>
                  </HStack>
                  <HStack
                    borderWidth={"1px"}
                    pb={1}
                    justifyContent={"space-between"}
                    w={"full"}
                  >
                    <Text fontSize={"xs"} fontWeight={"semibold"}>
                      Merchant ID:
                    </Text>
                    <Text fontSize={"xs"}>{receipt.data.user_id}</Text>
                  </HStack>
                  <HStack
                    borderWidth={"1px"}
                    pb={1}
                    justifyContent={"space-between"}
                    w={"full"}
                  >
                    <Text fontSize={"xs"} fontWeight={"semibold"}>
                      Merchant Mobile:
                    </Text>
                    <Text fontSize={"xs"}>{receipt.data.user_phone}</Text>
                  </HStack>
                  <Image pt={4} src="/logo_long.png" w={"20"} />
                  <Text fontSize={"xs"}>
                    {process.env.NEXT_PUBLIC_ORGANISATION_NAME}
                  </Text>
                </VStack>
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

      <VisuallyHidden>
        <table id="printable-table">
          <thead>
            <tr>
              <th>#</th>
              {columnDefs
                .filter((column) => {
                  if (
                    column.field != "metadata" &&
                    column.field != "name" &&
                    column.field != "receipt" &&
                    column.field != "status"
                  ) {
                    return column;
                  }
                })
                .map((column, key) => {
                  return <th key={key}>{column.headerName}</th>;
                })}
            </tr>
          </thead>
          <tbody>
            {printableRow.map((data, key) => {
              return (
                <tr key={key}>
                  <td>{key + 1}</td>
                  <td>{data.transaction_id}</td>
                  <td>{data.debit_amount}</td>
                  <td>{data.credit_amount}</td>
                  <td>{data.opening_balance}</td>
                  <td>{data.closing_balance}</td>
                  <td>{data.service_type}</td>
                  <td>
                    {JSON.parse(data.metadata).status ? "SUCCESS" : "FAILED"}
                  </td>
                  <td>{data.created_at}</td>
                  <td>{data.updated_at}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </VisuallyHidden>
    </>
  );
};

export default Index;
