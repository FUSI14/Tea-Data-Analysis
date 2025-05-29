import {
    Layout,
    Menu,
    message,
    Spin,
    Card,
    Row,
    Col,
    Typography,
} from "antd";
import {
    BarChartOutlined,
    AppstoreOutlined,
    ClusterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import "../App.css";
import AnalysisCharts from "./frequentitemsetschart";
import ClusterScatterChart from "./cluster";

const { Title } = Typography;
const { Sider, Content } = Layout;

const SECTION_KEYS = ["sales", "apriori", "cluster"];

function Analysis() {
    const [dataSummary, setDataSummary] = useState(null);
    const [dataApriori, setDataApriori] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeKey, setActiveKey] = useState("sales");

    const sectionRefs = {
        sales: useRef(null),
        apriori: useRef(null),
        cluster: useRef(null),
    };

    const apiURL = process.env.REACT_APP_API_URL;

    const loadSummary = () => {
        setLoading(true);
        axios
            .get(`${apiURL}/analysis/summary`)
            .then((res) => setDataSummary(res.data))
            .catch(() => message.error("获取销售分析数据失败"))
            .finally(() => setLoading(false));
    };

    const loadFrequent = () => {
        setLoading(true);
        axios
            .get(`${apiURL}/analysis/apriori`)
            .then((res) => setDataApriori(res.data))
            .catch(() => message.error("获取频繁项集数据失败"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadSummary();
        loadFrequent();
    }, [apiURL]);

    const getHotTeasOption = () => ({
        title: { text: "热门茶饮", left: "center" },
        tooltip: {},
        xAxis: {
            type: "category",
            data: dataSummary.hotTeas.map((item) => item.teaName),
        },
        yAxis: { type: "value" },
        series: [
            {
                name: "销量",
                type: "bar",
                data: dataSummary.hotTeas.map((item) => item.count),
                itemStyle: { color: "#69c0ff" },
            },
        ],
    });

    const getHotToppingsOption = () => ({
        title: { text: "热门小料", left: "center" },
        tooltip: { trigger: "item" },
        series: [
            {
                name: "使用次数",
                type: "pie",
                radius: "50%",
                data: dataSummary.hotToppings.map((item) => ({
                    name: item.toppingName,
                    value: item.count,
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
            },
        ],
    });

    const getTeaBaseOption = () => ({
        title: { text: "茶底销量", left: "center" },
        tooltip: {},
        xAxis: {
            type: "category",
            data: dataSummary.teaBaseSales.map((item) => item.teaBase),
        },
        yAxis: { type: "value" },
        series: [
            {
                name: "销量",
                type: "bar",
                data: dataSummary.teaBaseSales.map((item) => item.count),
                itemStyle: { color: "#95de64" },
            },
        ],
    });

    const handleMenuClick = (key) => {
        const ref = sectionRefs[key];
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const positions = SECTION_KEYS.map((key) => {
            const ref = sectionRefs[key].current;
            return {
                key,
                offset: ref ? Math.abs(ref.offsetTop - scrollTop) : Infinity,
            };
        });

        const nearest = positions.reduce((a, b) => (a.offset < b.offset ? a : b));
        setActiveKey(nearest.key);
    };

    return (
        <Layout style={{ height: "100vh" }}>
            {/* 固定侧边导航栏 */}
            <Sider
                width={220}
                style={{
                    background: "#fff",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                <div style={{ padding: "24px", fontWeight: "bold", fontSize: 16 }}>
                    茶饮销售数据挖掘展示
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeKey]}
                    onClick={({ key }) => handleMenuClick(key)}
                >
                    <Menu.Item key="sales" icon={<BarChartOutlined />}>
                        销售排行分析
                    </Menu.Item>
                    <Menu.Item key="apriori" icon={<AppstoreOutlined />}>
                        关联规则挖掘
                    </Menu.Item>
                    <Menu.Item key="cluster" icon={<ClusterOutlined />}>
                        用户偏好聚类分析
                    </Menu.Item>
                </Menu>
            </Sider>

            {/* 主体内容区 */}
            <Layout style={{ marginLeft: 220 }}>
                <Content
                    style={{
                        overflowY: "auto",
                        height: "100vh",
                        scrollBehavior: "smooth",
                    }}
                    onScroll={handleScroll}
                >
                    {loading || !dataSummary ? (
                        <Spin tip="加载中..." style={{ margin: "40vh auto", display: "block" }} />
                    ) : (
                        <>
                            {/* 销售排行分析 */}
                            <div
                                ref={sectionRefs.sales}
                                style={{ height: "100vh", padding: 24 }}
                            >
                                <Title level={2}>销售排行分析</Title>
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} md={8}>
                                        <Card hoverable>
                                            <ReactECharts
                                                option={getHotTeasOption()}
                                                style={{ height: 600 }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card hoverable>
                                            <ReactECharts
                                                option={getHotToppingsOption()}
                                                style={{ height: 600 }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card hoverable>
                                            <ReactECharts
                                                option={getTeaBaseOption()}
                                                style={{ height: 600 }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                            {/* 关联规则挖掘 */}
                            <div
                                ref={sectionRefs.apriori}
                                style={{ height: "100vh", padding: 24 }}
                            >
                                <Title level={2}>关联规则挖掘</Title>
                                <Card hoverable style={{ height: "calc(100% - 60px)" }}>
                                    <AnalysisCharts data={dataApriori} />
                                </Card>
                            </div>

                            {/* 用户偏好聚类分析 */}
                            <div
                                ref={sectionRefs.cluster}
                                style={{ height: "100vh", padding: 24 }}
                            >
                                <Title level={2}>用户偏好聚类分析</Title>
                                <Card hoverable style={{ height: "calc(100% - 60px)" }}>
                                    <ClusterScatterChart />
                                </Card>
                            </div>
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Analysis;
