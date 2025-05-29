import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import axios from "axios";

const clusterColors = ["#8884d8", "#82ca9d", "#ff7300", "#00C49F", "#FF8042"];
const apiURL = process.env.REACT_APP_API_URL;

const ClusterScatterChart = () => {
  const [grouped, setGrouped] = useState({});
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${apiURL}/analysis/cluster`)
      .then((res) => {
        const rawData = res.data.data;
        const groupedData = {};
        rawData.forEach((item) => {
          if (!groupedData[item.cluster]) groupedData[item.cluster] = [];
          groupedData[item.cluster].push({
            userId: item.user_id,
            tea_count: item.tea_count,
            topping_count: item.topping_count,
            cluster: item.cluster
          });
        });
        setGrouped(groupedData);
        setSummary(res.data.summary || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("加载数据失败：" + err.message);
        setLoading(false);
      });
  }, [apiURL]);

  if (loading) return <p>加载中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="tea_count"
            name="Tea Count"
            label={{ value: "茶饮数", position: "insideBottomRight", offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="topping_count"
            name="Topping Count"
            label={{
              value: "小料数",
              angle: -90,
              position: "insideLeft"
            }}
          />
          <ZAxis type="category" dataKey="userId" name="用户" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => [
              value,
              name === "tea_count"
                ? "茶饮数"
                : name === "topping_count"
                ? "小料数"
                : "用户"
            ]}
          />
          <Legend />
          {Object.keys(grouped).map((cluster) => (
            <Scatter
              key={cluster}
              name={`用户群 ${parseInt(cluster) + 1}`}
              data={grouped[cluster]}
              fill={clusterColors[cluster % clusterColors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div style={{ marginTop: "20px" }}>
        <h2>总结</h2>
        <ul>
          {summary.map((item, index) => (
            <h3 key={index}>{item}</h3>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClusterScatterChart;
