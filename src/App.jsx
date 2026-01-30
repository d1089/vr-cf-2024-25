import { useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import { CurrencyRupee } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";

function App() {
  const [stats, setStats] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCentre, setSelectedCentre] = useState("VSR");
  const [customTagId, setCustomTagId] = useState("");
  const [eventEntityId, setEventEntityId] = useState("8970753");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Centre to tag_id mapping - Add more centres as needed
  const centreOptions = [
    { centre: "OLH", tagId: "11232", label: "OLH" },
    {
      centre: "VSR",
      tagId: "11235",
      label: "VSR",
    },
    { centre: "VAT", tagId: "11234", label: "VAT" },
    { centre: "SFC", tagId: "11233", label: "SFC" },
    { centre: "COGF", tagId: "11231", label: "COGF" },
  ];

  const headers = {
    Accept: "*/*",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWFyY2hSdWxlcyI6eyJwcm9kX2Rpc2Vhc2VzIjp7fSwicHJvZF9ob3NwaXRhbHMiOnt9LCJmdW5kcmFpc2VyX3Byb2QiOnsiZmlsdGVyIjoicGFyZW50X2NhdXNlX2lkICE9IDE0OSJ9fSwiYXBpS2V5VWlkIjoiMjk0YjYzMTAtZjdiNC00MDdiLTg2MWYtMGQ0MTJmMzdkZjc4IiwiaWF0IjoxNjc2ODg3NzkzfQ.CXJdTbdG2JMQPQYnCuXsrv0oFlOjDs8hO3w0Rep4lUE",
    "Content-Type": "application/json",
    Origin: "https://uandiforeverychild.ketto.org",
    Referer: "https://uandiforeverychild.ketto.org/",
  };

  const getRealData = async (tagId, entityId = eventEntityId) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        q: "",
        facets: [],
        attributesToHighlight: ["*"],
        highlightPreTag: "__ais-highlight__",
        highlightPostTag: "__/ais-highlight__",
        limit: 100, // Increased to get more data
        offset: 0,
        filter: [`event_entity_details_id=${entityId}`, `tag_id=${tagId}`],
        sort: ["raised.currencies.INR:desc"],
      };

      const res = await axios.post(
        "https://msearch.ketto.org/indexes/fundraiser_prod/search",
        payload,
        { headers },
      );

      const formattedData = res.data.hits.map((i, index) => {
        const raisedINR = i.raised?.currencies?.INR || 0;
        return {
          id: index + 1,
          fullName: i.campaigner?.full_name || "N/A",
          targetAmt: i.amount_requested || 0,
          raisedAmt: parseFloat(raisedINR),
          supporters: i.raised?.backers || 0,
          percentageRaised:
            parseFloat(i.amount_requested) > 0
              ? (
                  (parseFloat(raisedINR) / parseFloat(i.amount_requested)) *
                  100
                ).toFixed(1)
              : 0,
        };
      });

      setStats(formattedData);
      setFilteredRows(formattedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again later.");
      setLoading(false);
    }
  };

  const handleCentreChange = (event) => {
    const value = event.target.value;
    setSelectedCentre(value);

    if (value !== "custom") {
      const selected = centreOptions.find((c) => c.centre === value);
      if (selected) {
        getRealData(selected.tagId, eventEntityId);
      }
    }
  };

  const handleCustomTagSubmit = () => {
    if (customTagId.trim()) {
      getRealData(customTagId, eventEntityId);
    }
  };

  const handleRefresh = () => {
    if (selectedCentre === "custom") {
      if (customTagId.trim()) {
        getRealData(customTagId, eventEntityId);
      }
    } else {
      const selected = centreOptions.find((c) => c.centre === selectedCentre);
      if (selected) {
        getRealData(selected.tagId, eventEntityId);
      }
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "targetAmt",
      headerName: "Target (₹)",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      // valueFormatter: (params) => {
      //   return new Intl.NumberFormat("en-IN").format(params);
      // },
    },
    {
      field: "raisedAmt",
      headerName: "Raised (₹)",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      // valueFormatter: (params) => {
      //   return new Intl.NumberFormat("en-IN").format(params);
      // },
    },
    {
      field: "percentageRaised",
      headerName: "Progress (%)",
      type: "number",
      flex: 0.7,
      minWidth: 100,
      // valueFormatter: (params) => `${params}%`,
    },
    {
      field: "supporters",
      headerName: "Supporters",
      type: "number",
      flex: 0.7,
      minWidth: 100,
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

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

  useEffect(() => {
    const initialCentre = centreOptions.find(
      (c) => c.centre === selectedCentre,
    );
    if (initialCentre) {
      getRealData(initialCentre.tagId);
    }
  }, []);

  const totals = stats.reduce(
    (acc, row) => {
      acc.totalTargetAmt += row.targetAmt;
      acc.totalRaisedAmt += row.raisedAmt;
      acc.totalSupporters += row.supporters;
      return acc;
    },
    { totalTargetAmt: 0, totalRaisedAmt: 0, totalSupporters: 0 },
  );

  const overallPercentage =
    totals.totalTargetAmt > 0
      ? ((totals.totalRaisedAmt / totals.totalTargetAmt) * 100).toFixed(1)
      : 0;

  // Top 5 fundraisers for chart
  const top5Fundraisers = [...stats]
    .sort((a, b) => b.raisedAmt - a.raisedAmt)
    .slice(0, 5)
    .map((item) => ({
      name: item.fullName.split(" ").slice(0, 2).join(" "), // First two names for better readability
      raised: item.raisedAmt,
      target: item.targetAmt,
    }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Pie chart data for raised vs remaining
  const pieData = [
    { name: "Raised", value: totals.totalRaisedAmt },
    {
      name: "Remaining",
      value: Math.max(0, totals.totalTargetAmt - totals.totalRaisedAmt),
    },
  ];

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading donation data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, minHeight: "100vh", bgcolor: "#f5f5f5" }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #aa2605ff 0%, #e76a5cff 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ color: "white", fontWeight: "bold", mb: 1 }}
            >
              U&I Mumbai CF 2025-26 Analysis
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
              {selectedCentre === "custom"
                ? "Donation Tracking Dashboard - Custom Centre"
                : `Donation Tracking Dashboard - ${centreOptions.find((c) => c.centre === selectedCentre)?.centre || ""}`}
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <FilterListIcon sx={{ color: "#667eea" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Filters
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Centre</InputLabel>
              <Select
                value={selectedCentre}
                label="Select Centre"
                onChange={handleCentreChange}
              >
                {centreOptions.map((option) => (
                  <MenuItem key={option.centre} value={option.centre}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedCentre === "custom" && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Enter Custom Tag ID"
                  value={customTagId}
                  onChange={(e) => setCustomTagId(e.target.value)}
                  placeholder="e.g., 11235"
                />
                <Button
                  variant="contained"
                  onClick={handleCustomTagSubmit}
                  disabled={!customTagId.trim()}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Grid>
          )}

          {/* <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Event Entity ID"
              value={eventEntityId}
              onChange={(e) => setEventEntityId(e.target.value)}
              onBlur={() => {
                if (selectedCentre === "custom" && customTagId.trim()) {
                  getRealData(customTagId, eventEntityId);
                } else if (selectedCentre !== "custom") {
                  const selected = centreOptions.find(
                    (c) => c.centre === selectedCentre,
                  );
                  if (selected) {
                    getRealData(selected.tagId, eventEntityId);
                  }
                }
              }}
            />
          </Grid> */}
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CurrencyRupee sx={{ color: "#667eea", mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Centre Target
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                ₹{new Intl.NumberFormat("en-IN").format(totals.totalTargetAmt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingUpIcon sx={{ color: "#00C49F", mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total Raised
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#00C49F" }}
              >
                ₹{new Intl.NumberFormat("en-IN").format(totals.totalRaisedAmt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overallPercentage}% of target
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PeopleIcon sx={{ color: "#FF8042", mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total Supporters
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {new Intl.NumberFormat("en-IN").format(totals.totalSupporters)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CurrencyRupee sx={{ color: "#FFBB28", mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                ₹
                {new Intl.NumberFormat("en-IN").format(
                  Math.max(0, totals.totalTargetAmt - totals.totalRaisedAmt),
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Top 5 Fundraisers
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={top5Fundraisers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <RechartsTooltip
                  formatter={(value) =>
                    `₹${new Intl.NumberFormat("en-IN").format(value)}`
                  }
                />
                <Legend />
                <Bar dataKey="raised" fill="#00C49F" name="Raised Amount" />
                <Bar dataKey="target" fill="#667eea" name="Target Amount" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Overall Progress
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={isMobile ? 70 : 90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) =>
                    `₹${new Intl.NumberFormat("en-IN").format(value)}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Fundraiser Details ({filteredRows.length} records)
          </Typography>
          <TextField
            label="Search"
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: isMobile ? "100%" : 300 }}
          />
        </Box>
        <Box sx={{ height: isMobile ? 400 : 500, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
