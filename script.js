// Global variables to store chart instances
let revenueChart, productSalesChart, regionalSalesChart;

// Fetch sales data from data.json
async function fetchSalesData() {
    try {
        const response = await fetch("data.json");
        const salesData = await response.json();
        initializeCharts(salesData); // Initialize charts with fetched data
        setupFilters(salesData); // Set up filters
    } catch (error) {
        console.error("Error loading sales data:", error);
    }
}

// Initialize Chart.js charts
function initializeCharts(data) {
    const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
    const ctxProductSales = document.getElementById("productSalesChart").getContext("2d");
    const ctxRegionalSales = document.getElementById("regionalSalesChart").getContext("2d");

    // Revenue Trend (Line Chart)
    revenueChart = new Chart(ctxRevenue, {
        type: "line",
        data: {
            labels: data.revenue.map(item => item.date),
            datasets: [{
                label: "Revenue ($)",
                data: data.revenue.map(item => item.amount),
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                fill: true
            }]
        }
    });

    // Product Sales (Pie Chart)
    productSalesChart = new Chart(ctxProductSales, {
        type: "pie",
        data: {
            labels: data.products.map(item => item.category),
            datasets: [{
                label: "Sales",
                data: data.products.map(item => item.sales),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
            }]
        }
    });

    // Regional Sales (Bar Chart)
    regionalSalesChart = new Chart(ctxRegionalSales, {
        type: "bar",
        data: {
            labels: data.regions.map(item => item.name),
            datasets: [{
                label: "Sales ($)",
                data: data.regions.map(item => item.sales),
                backgroundColor: "#4CAF50"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Function to apply filters and update charts
function applyFilters(originalData) {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const selectedCategory = document.getElementById("category").value;
    const selectedRegion = document.getElementById("region").value;

    let filteredData = JSON.parse(JSON.stringify(originalData)); // Deep copy original data

    // Filter Revenue Data by Date Range
    if (startDate && endDate) {
        filteredData.revenue = originalData.revenue.filter(item => 
            item.date >= startDate && item.date <= endDate
        );
    }

    // Filter Product Sales by Category
    if (selectedCategory !== "all") {
        filteredData.products = originalData.products.filter(item => item.category === selectedCategory);
    }

    // Filter Regional Sales by Region
    if (selectedRegion !== "all") {
        filteredData.regions = originalData.regions.filter(item => item.name === selectedRegion);
    }

    updateCharts(filteredData); // Refresh charts with new filtered data
}

// Function to update chart data dynamically
function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update(); // Refresh chart
}

// Set up event listeners for filters
function setupFilters(originalData) {
    document.getElementById("startDate").addEventListener("change", () => applyFilters(originalData));
    document.getElementById("endDate").addEventListener("change", () => applyFilters(originalData));
    document.getElementById("category").addEventListener("change", () => applyFilters(originalData));
    document.getElementById("region").addEventListener("change", () => applyFilters(originalData));
}
// Function to convert filtered data to CSV and download
function downloadFilteredCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Category,Sales,Region\n"; // Header row

    const selectedDate = document.getElementById("date").value;
    const selectedCategory = document.getElementById("category").value;
    const selectedRegion = document.getElementById("region").value;

    fetch("data.json")
        .then(response => response.json())
        .then(originalData => {
            let filteredData = JSON.parse(JSON.stringify(originalData)); // Deep copy original data

            // Filter Revenue Data
            if (selectedDate) {
                filteredData.revenue = originalData.revenue.filter(item => item.date === selectedDate);
            }

            // Filter Product Sales
            if (selectedCategory !== "all") {
                filteredData.products = originalData.products.filter(item => item.category === selectedCategory);
            }

            // Filter Regional Sales
            if (selectedRegion !== "all") {
                filteredData.regions = originalData.regions.filter(item => item.name === selectedRegion);
            }

            // Generate CSV based on the filtered data
            filteredData.revenue.forEach(item => {
                csvContent += `${item.date},,${item.amount},\n`;
            });

            filteredData.products.forEach(item => {
                csvContent += `,${item.category},${item.sales},\n`;
            });

            filteredData.regions.forEach(item => {
                csvContent += `,,${item.sales},${item.name}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "filtered_sales_data.csv");
            document.body.appendChild(link);
            link.click();
        })
        .catch(error => console.error("Error filtering data:", error));
}

// Attach Download Event Listener
document.getElementById("downloadCSV").addEventListener("click", downloadFilteredCSV);

// Load sales data on page load
document.addEventListener("DOMContentLoaded", fetchSalesData);
