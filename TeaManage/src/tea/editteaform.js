import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Upload, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

function EditTeaForm({ teaData, onSuccess }) {
    const [form] = Form.useForm();
    const apiURL = process.env.REACT_APP_API_URL;
    const [previewUrl, setPreviewUrl] = useState(""); // 预览图片路径

    useEffect(() => {
        if (teaData) {
            form.setFieldsValue(teaData); // 初始化表单数据
            setPreviewUrl(teaData.teaImage); // 设置预览图
        }
    }, [teaData, form]);

    const onFinish = (values) => {
        console.log(values);
        axios.put(`${apiURL}/tea/${teaData.teaId}`, values)
            .then(() => {
                onSuccess(); // 通知父组件刷新数据并关闭弹窗
            })
            .catch(() => {
                message.error("修改失败，请稍后再试");
            });
    };
    const uploadProps = {
    name: "file",
    action: `${apiURL}/upload`, // 上传接口
    showUploadList: false,
    onChange(info) {
        if (info.file.status === "done") {
            // 处理后端返回的路径
            const url = info.file.response.image_url || info.file.response;
            const fullUrl = apiURL + url;
            setPreviewUrl(fullUrl);
            form.setFieldsValue({ teaImage: fullUrl }); // 将路径设置到表单
            message.success("图片上传成功");
        } else if (info.file.status === "error") {
            message.error("上传失败");
        }
    },
};


    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="teaName" label="茶饮名称" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="fixedAddons" label="固定小料">
                <Input />
            </Form.Item>

            <Form.Item label="茶饮图片上传" name="teaImage">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传图片</Button>
                </Upload>
                {previewUrl && (
                    <div style={{ marginTop: 10 }}>
                        <Image src={previewUrl} width={100} />
                    </div>
                )}
            </Form.Item>

            <Form.Item name="teaBase" label="茶底">
                <Input />
            </Form.Item>

            <Form.Item name="price" label="价格">
                <Input type="number" min={0} step={0.01} />
            </Form.Item>

            <Button type="primary" htmlType="submit">提交</Button>
        </Form>
    );
}

export default EditTeaForm;
