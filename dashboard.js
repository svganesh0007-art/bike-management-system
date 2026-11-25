
const API = "http://localhost:5001/api";
const userId = sessionStorage.getItem("userId");

async function loadDashboardStats() {
    if (!userId) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    try {
        const bikeResponse = await fetch(
            `${API}/bikes/my-bikes/${userId}`
        );

        const bikeData = await bikeResponse.json();

        if (!bikeResponse.ok) {
            throw new Error(bikeData.message);
        }

        const bikes = bikeData.bikes || [];

        let totalDocuments = 0;
        let totalServices = 0;
        let totalExpenses = 0;
        let allExpenses = [];

        const results = await Promise.all(
            bikes.map(async bike => {
                const [documentResponse, serviceResponse, expenseResponse] =
                    await Promise.all([
                        fetch(`${API}/documents/bike/${bike._id}?userId=${encodeURIComponent(userId)}`),
                        fetch(`${API}/services/bike/${bike._id}?userId=${encodeURIComponent(userId)}`),
                        fetch(`${API}/expenses/bike/${bike._id}?userId=${encodeURIComponent(userId)}`)
                    ]);

                const documentData = await documentResponse.json();
                const serviceData = await serviceResponse.json();
                const expenseData = await expenseResponse.json();

                if (!documentResponse.ok || !serviceResponse.ok || !expenseResponse.ok) {
                    throw new Error("Unable to load dashboard details");
                }

                return {
                    documents: documentData.documents || [],
                    services: serviceData.services || [],
                    expenses: expenseData.expenses || []
                };
            })
        );

        results.forEach(result => {
            totalDocuments += result.documents.length;
            totalServices += result.services.length;

            result.services.forEach(service => {
                totalExpenses += Number(service.amount) || 0;
            });

            allExpenses.push(...result.expenses);
        });

        document.getElementById("totalBikes").textContent = bikes.length;
        document.getElementById("totalDocuments").textContent = totalDocuments;
        document.getElementById("totalServices").textContent = totalServices;
        document.getElementById("totalExpenses").textContent =
            "₹" + totalExpenses.toLocaleString("en-IN");

        loadExpenseChart(allExpenses);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

function loadExpenseChart(expenses) {
    const canvas = document.getElementById("monthlyExpenseChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const months = [];
    const totals = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        months.push({
            label: date.toLocaleString("en-IN", { month: "short" }),
            month: date.getMonth(),
            year: date.getFullYear()
        });
    }

    months.forEach(month => {
        const total = expenses
            .filter(expense => {
                const date = new Date(expense.expenseDate);

                return date.getMonth() === month.month &&
                    date.getFullYear() === month.year;
            })
            .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

        totals.push(total);
    });

    function drawChart() {
        const width = canvas.clientWidth;
        const height = 280;
        const ratio = window.devicePixelRatio || 1;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.height = height + "px";

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...totals, 100);
        const chartHeight = 190;
        const barWidth = Math.min(35, width / 10);
        const gap = (width - months.length * barWidth) / 7;

        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        months.forEach((month, index) => {
            const x = gap + index * (barWidth + gap);
            const barHeight = (totals[index] / maxValue) * chartHeight;
            const y = 220 - barHeight;

            ctx.fillStyle = "#2563eb";
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = "#64748b";
            ctx.fillText(month.label, x + barWidth / 2, 245);

            ctx.fillStyle = "#1e293b";
            ctx.fillText(
                Math.round(totals[index]),
                x + barWidth / 2,
                Math.max(y - 8, 15)
            );
        });
    }

    drawChart();
    window.addEventListener("resize", drawChart);
}

loadDashboardStats();
