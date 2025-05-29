import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { message } from 'antd';
import './analysis.css'
const apiURL = process.env.REACT_APP_API_URL;

const FrequentItemsetsChart = ({ data }) => {
  const itemsets = data.frequent_itemsets;

  // 准备数据
  const labels = itemsets.map((item) => item.itemsets.join(', '));
  const supports = itemsets.map((item) => (item.support * 100).toFixed(2));

  const option = {
    title: {
      text: '频繁项集支持度分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const { name, value } = params[0];
        return `${name}<br/>支持度: ${value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '支持度（%）',
    },
    series: [
      {
        data: supports,
        type: 'bar',
        itemStyle: {
          color: '#73C0DE',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

const AssociationRulesChart = ({ data }) => {
  const rules = data.association_rules;

  const scatterData = rules.map((rule) => ({
    name: `${rule.antecedents.join(', ')} → ${rule.consequents.join(', ')}`,
    value: [rule.lift, rule.confidence],
  }));

  const option = {
    title: {
      text: '关联规则分析图',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (param) => {
        return `${param.data.name}<br/>Lift: ${param.data.value[0]}<br/>Confidence: ${(param.data.value[1] * 100).toFixed(2)}%`;
      },
    },
    xAxis: {
      name: 'Lift',
      type: 'value',
    },
    yAxis: {
      name: 'Confidence',
      type: 'value',
      min: 0,
      max: 1,
    },
    series: [
      {
        symbolSize: 10,
        data: scatterData,
        type: 'scatter',
        itemStyle: {
          color: '#5470C6',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

const Summary = () => {
  const [summarydata, setSummaryData] = useState("");
  const getSummary = () => {
    axios.get(`${apiURL}/analysis/apriori`)
      .then((res) => {
        const data = res.data.summary.description;
        setSummaryData(data);
      })
      .catch(() => {
        message.error("获取总结数据失败");
      })
  }
  useEffect(() => {
    getSummary();
  }, [apiURL])
  return (
    <div>
      <h2>总结</h2>
      <h3>{summarydata}</h3>
    </div>
  )
}

export default function AnalysisCharts({ data }) {
  return (
    <div>
      <div className='flex'>
        <div style={{ width: 75 + 'vh' }}>
          <FrequentItemsetsChart data={data} />
        </div>
        <div style={{ width: 75 + 'vh' }}>
          <AssociationRulesChart data={data} />
        </div>
      </div>
      <Summary />
    </div>
  );
}
