import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Box, Container, Grid2, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

function App() {
  const [stats, setStats] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  console.log(filteredRows);

  const payload = {
    q: "",
    facets: [],
    attributesToHighlight: ["*"],
    highlightPreTag: "__ais-highlight__",
    highlightPostTag: "__/ais-highlight__",
    limit: 25,
    offset: 0,
    filter: ["event_entity_details_id=8339502", "tag_id=9442"],
  };

  const headers = {
    Accept: "*/*",
    Authorization:
      // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWFyY2hSdWxlcyI6eyJwcm9kX2Rpc2Vhc2VzIjp7fSwicHJvZF9ob3NwaXRhbHMiOnt9LCJmdW5kcmFpc2VyX3Byb2QiOnsiZmlsdGVyIjoicGFyZW50X2NhdXNlX2lkICE9IDE0OSJ9fSwiYXBpS2V5VWlkIjoiMjk0YjYzMTAtZjdiNC00MDdiLTg2MWYtMGQ0MTJmMzdkZjc4IiwiaWF0IjoxNjc2ODg3NzkzfQ.CXJdTbdG2JMQPQYnCuXsrv0oFlOjDs8hO3w0Rep4lUE",
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWFyY2hSdWxlcyI6eyJwcm9kX2Rpc2Vhc2VzIjp7fSwicHJvZF9ob3NwaXRhbHMiOnt9LCJmdW5kcmFpc2VyX3Byb2QiOnsiZmlsdGVyIjoicGFyZW50X2NhdXNlX2lkICE9IDE0OSJ9fSwiYXBpS2V5VWlkIjoiMjk0YjYzMTAtZjdiNC00MDdiLTg2MWYtMGQ0MTJmMzdkZjc4IiwiaWF0IjoxNjc2ODg3NzkzfQ.CXJdTbdG2JMQPQYnCuXsrv0oFlOjDs8hO3w0Rep4lUE",
    Origin: "https://uandiforeverychild.ketto.org",
    Referer: "https://uandiforeverychild.ketto.org/",
  };

  const getRealData = () => {
    try {
      axios
        .post(
          "https://msearch.ketto.org/indexes/fundraiser_prod/search",
          payload,
          {
            headers,
          }
        )
        .then((res) => {
          setStats(
            res.data.hits.map((i, index) => {
              return {
                id: index + 1,
                fullName: i.campaigner.full_name,
                targetAmt: i.amount_requested,
                raisedAmt:
                  i.raised.raised !== undefined
                    ? parseFloat(i.raised.raised)
                    : 0,
                supporters:
                  i.raised.backers !== undefined ? i.raised.backers : 0,
              };
            })
          );
          setFilteredRows(stats);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "fullName",
      headerName: "Name",
      width: 150,
    },
    {
      field: "targetAmt",
      headerName: "Target Amount",
      type: "number",
      width: 150,
    },
    {
      field: "raisedAmt",
      headerName: "Raised Amount",
      type: "number",
      width: 110,
    },
    {
      field: "supporters",
      headerName: "Supporters",
      // description: "This column has a value getter and is not sortable.",
      // sortable: false,
      width: 160,
      type: "number",
      // valueGetter: (value, row) =>
      //   `${row.firstName || ""} ${row.lastName || ""}`,
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter rows based on search term
    const filtered = stats.filter((row) => {
      return columns.some((column) => {
        return (
          row[column.field] &&
          row[column.field]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      });
    });

    setFilteredRows(filtered);
  };

  // const rows = [
  //   { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
  //   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  //   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  //   { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  //   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  //   { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  //   { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  //   { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  //   { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  // ];

  useEffect(() => {
    getRealData();
  }, []);

  useEffect(() => {
    if (filteredRows.length == 0) setFilteredRows(stats);
  });

  const totals = stats.reduce(
    (acc, row) => {
      acc.totalTargetAmt += row.targetAmt;
      acc.totalRaisedAmt += row.raisedAmt;
      acc.totalSupporters += row.supporters;
      return acc;
    },
    { totalTargetAmt: 0, totalRaisedAmt: 0, totalSupporters: 0 }
  );

  return (
    <>
      <Container sx={{ backgroundColor: "aquamarine", height: "100vh" }}>
        <Box sx={{ height: "90vh", width: "100%" }}>
          <Box sx={{ paddingTop: "2rem" }}>
            <Typography component={"h2"}>VR CF 2024-25 Analysis</Typography>
          </Box>
          <Grid2
            container
            justifyContent="space-between"
            style={{ marginBottom: 16, marginTop: "1.5rem" }}
          >
            <Typography>Total Target Amt: {totals.totalTargetAmt}</Typography>
            <Typography>Total Raised Amt: {totals.totalRaisedAmt}</Typography>
            <Typography>Supporters: {totals.totalSupporters}</Typography>

            <TextField
              label="Search"
              size="small"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: 300 }}
            />
          </Grid2>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
            }}
            pageSizeOptions={[25]}
            // checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Container>
    </>
  );
}

export default App;
