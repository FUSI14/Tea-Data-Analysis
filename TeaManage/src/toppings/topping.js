import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Modal, Form, Input } from "antd";
import axios from "axios"
import "../App.css"
import {
  PlusOutlined
} from '@ant-design/icons';

function Toppings() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const apiURL = process.env.REACT_APP_API_URL;

  const loadingToppingsList = () => {
    setLoading(true);
    axios.get(`${apiURL}/toppings/get`)
      .then((res) => {
        console.log(res.data)
        const data = res.data.map(item => ({
          toppingId: item.toppingId,
          toppingName: item.toppingName,
          toppingPrice: item.toppingPrice
        }));
        setDataSource(data);
      })
      .catch(() => {
        message.error("获取小料数据失败");
      })
      .finally(() => {
        setLoading(false);
      })
  }
  const [isModalOpen_add, setisModalOpen_add] = useState(false);
  const showAdd = () => {
    setisModalOpen_add(true);
  }

  const handleCancel = () => {
    setisModalOpen_add(false);
  };


  const onFinish = (values) => {
    const payload = {
      ...values,
    };

    axios
      .post(`${apiURL}/toppings/add`, payload)
      .then(() => {
        message.success("小料添加成功");
        form.resetFields();
        setisModalOpen_add(false);
        loadingToppingsList();
      })
      .catch(() => {
        message.error("添加失败");
      });
  };

  // 删除弹出框
  const [selectedToppingId, setSelectedToppingId] = useState(null);
  const [ifDelete, setIfDelete] = useState(false);
  const handleDelete = function (record) {
    setIfDelete(true);
    setSelectedToppingId(record.toppingId);
  }
  const deleteCancel = () => {
    setIfDelete(false);
  };
  const deleteTopping = () => {
    if (!selectedToppingId) {
      message.error("无效的小料ID");
      return;
    }

    axios.delete(`${apiURL}/toppings/${selectedToppingId}`)
      .then(() => {
        message.success("删除成功！");
        loadingToppingsList();  // 重新加载数据
      })
      .catch(() => {
        message.error("删除失败，请稍后再试");
      })
      .finally(() => {
        setIfDelete(false);
        setSelectedToppingId(null);  // 清空选中的ID
      });
  }

  // 修改弹出框
  const [editForm] = Form.useForm();
  const [ifEdit, setIfEdit] = useState(false);
  const [editData, setEditData] = useState([]);
  useEffect(() => {
    if (ifEdit && editData) {
      editForm.setFieldsValue({ toppingName: editData.toppingName });
    }
  }, [ifEdit, editData]);

  const handleEdit = (record) => {
    setEditData(record);
    setIfEdit(true);
  };

  const onEditFinish = (values) => {
    axios.put(`${apiURL}/toppings/${editData.toppingId}`, values)
      .then(() => {
        message.success("小料更新成功");
        setIfEdit(false);
        loadingToppingsList();
      })
      .catch(() => {
        message.error("更新失败");
      });
  };

  const editCancel = () => {
    setIfEdit(false);
    editForm.resetFields();
  };


  // 获取小料数据
  useEffect(() => {
    loadingToppingsList();
  }, [apiURL])

  const columns = [
    {
      title: "小料编号",
      dataIndex: "toppingId",
      key: "toppingId",
    },
    {
      title: "小料名称",
      dataIndex: "toppingName",
      key: "toppingName",
    },
    {
      title: "小料价格",
      dataIndex: "toppingPrice",
      key: "toppingPrice",
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
      ),
    },
  ];

  return (
    <div>
      <div className="right">
        <Button type="primary" onClick={() => showAdd()} icon={<PlusOutlined />}>新增小料</Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="toppingId"
        loading={loading}
      >
      </Table>
      {/* 删除 */}
      <Modal
        title="是否确定删除？"
        open={ifDelete}
        onCancel={deleteCancel}
        footer={null}  // 没有底部按钮
        closable={true}  // 显示右上角的叉
      >
        <div className="center-flex">
          <Button danger type="primary" onClick={() => deleteTopping()}>确定</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => deleteCancel()}>取消</Button>
        </div>
      </Modal>
      {/* 新增小料弹框 */}
      <Modal
        title="新增小料"
        open={isModalOpen_add}
        onCancel={handleCancel}
        footer={null}  // 没有底部按钮
        closable={true}  // 显示右上角的叉
      >
        <Form onFinish={onFinish}>
          <Form.Item label="小料名称" name="toppingName">
            <Input placeholder='例如：红豆' />
          </Form.Item>
          <Form.Item
            label="价格（元）"
            name="toppingPrice"
            rules={[{ required: true, message: "请输入价格" }]}
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              确认添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* 更新小料弹框 */}
      <Modal
        title="更新小料信息"
        open={ifEdit}
        onCancel={editCancel}
        footer={null}
        closable={true}
      >
        <Form
          form={editForm}
          onFinish={onEditFinish}
        >
          <Form.Item label="小料名称" name="toppingName" rules={[{ required: true, message: "请输入小料名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="toppingPrice" label="价格">
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">确认更新</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default Toppings;