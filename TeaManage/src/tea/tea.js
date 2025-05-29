import { Button, message, Modal, Space, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../App.css"
import {
    PlusOutlined
} from '@ant-design/icons';
import AddTeaForm from "./addteaform";
import EditTeaForm from "./editteaform";

function Tea() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState([]);
    const apiURL = process.env.REACT_APP_API_URL;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeaId, setSelectedTeaId] = useState(null);

    const loadTeaList = () => {
        setLoading(true);
        axios.get(`${apiURL}/tea/get`)
            .then(async (res) => {
                // console.log("茶饮返回数据：", res.data);
                const dataWithClassifyNames = await Promise.all(
                    res.data.map(async (item) => {
                        try {
                            const classifyRes = await axios.get(`${apiURL}/classify/id_filter/${item.classifyId}`);
                            return {
                                teaId: item.teaId,
                                teaName: item.teaName,
                                classifyName: classifyRes.data.classifyName || "未知分类",
                                fixedAddons: item.fixedAddons,
                                teaImage: item.teaImage,
                                teaBase: item.teaBase,
                                price: item.price
                            };
                        } catch {
                            return {
                                teaId: item.teaId,
                                teaName: item.teaName,
                                classifyName: "获取失败",
                                fixedAddons: item.fixedAddons,
                                teaImage: item.teaImage,
                                teaBase: item.teaBase,
                                price: item.price
                            };
                        }
                    })
                );
                setDataSource(dataWithClassifyNames);
            })
            .catch(() => {
                message.error("获取茶饮数据失败");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadTeaList();
    }, [apiURL]);

    // 修改弹出框
    const [ifEdit, setIfEdit] = useState(false);
    const [editData, setEditData] = useState([]);
    const handleEdit = function (record) {
        setIfEdit(true);
        setEditData(record);
    }
    const editCancel = () => {
        setIfEdit(false);
    };

    // 删除弹出框
    const [ifDelete, setIfDelete] = useState(false);
    const handleDelete = function (record) {
        setIfDelete(true);
        setSelectedTeaId(record.teaId);
    }
    const deleteCancel = () => {
        setIfDelete(false);
    };
    // 删除茶饮函数
    const deleteTea = () => {
        if (!selectedTeaId) {
            message.error("无效的茶饮ID");
            return;
        }

        axios.delete(`${apiURL}/tea/${selectedTeaId}`)
            .then(() => {
                message.success("删除成功！");
                loadTeaList();  // 重新加载数据
            })
            .catch(() => {
                message.error("删除失败，请稍后再试");
            })
            .finally(() => {
                setIfDelete(false);
                setSelectedTeaId(null);  // 清空选中的ID
            });
    }

    // 添加茶饮对话框
    const showAdd = function () {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // 添加茶饮成功函数
    const handleAddSuccess = () => {
        message.success("添加茶饮成功！");
        setIsModalOpen(false); // 关闭弹窗
        loadTeaList();//刷新表格
    };

    

    const columns = [
        {
            title: "编号",
            dataIndex: "teaId",
            key: "teaId"
        },
        {
            title: "茶饮名称",
            dataIndex: "teaName",
            key: "teaName"
        },
        {
            title: "分类名称",
            dataIndex: "classifyName",
            key: "classifyName"
        },
        {
            title: "固定小料",
            dataIndex: "fixedAddons",
            key: "fixedAddons"
        },
        {
            title: "茶饮图片路径",
            dataIndex: "teaImage",
            key: "teaImage"
        },
        {
            title: "茶底",
            dataIndex: "teaBase",
            key: "teaBase"
        },
        {
            title: "价格",
            dataIndex: "price",
            key: "price"
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        修改
                    </Button>
                    <Button danger onClick={() => handleDelete(record)}>
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div className="right">
                <Button type="primary" onClick={() => showAdd()} icon={<PlusOutlined />}>新增茶饮</Button>
            </div>
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="teaId"
                loading={loading}
            />
            <Modal
                title="添加茶饮"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}  // 没有底部按钮
                closable={true}  // 显示右上角的叉
            >
                <AddTeaForm onSuccess={handleAddSuccess} />
            </Modal>
            <Modal
                title="是否确定删除？"
                open={ifDelete}
                onCancel={deleteCancel}
                footer={null}  // 没有底部按钮
                closable={true}  // 显示右上角的叉
            >
                <div className="center-flex">
                    <Button danger type="primary" onClick={() => deleteTea()}>确定</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button onClick={() => deleteCancel()}>取消</Button>
                </div>
            </Modal>
            <Modal
                title="修改茶饮信息"
                open={ifEdit}
                onCancel={editCancel}
                footer={null}  // 没有底部按钮
                closable={true}  // 显示右上角的叉
            >
                {/* 传入数据 */}
                <div className="center-flex">
                    <EditTeaForm teaData={editData} onSuccess={() => {
                        message.success("修改成功！");
                        setIfEdit(false);
                        loadTeaList(); // 重新加载列表
                    }} />
                </div>
            </Modal>
        </div>
    )
}
export default Tea;