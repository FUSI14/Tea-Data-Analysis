import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import './App.css'

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // 登录验证
        if (username && password) {
            navigate('/main');
        } else {
            alert('请输入用户名和密码');
        }
    };

    return (
        <div className='login-body center-flex'>
            <div className='login-card center-flex'>
                <div>
                    <h1 className='login-title'>茶饮点单管理系统登录</h1>
                    <div>
                        <Input
                            type="text"
                            placeholder="用户名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='login-input'
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='login-input'
                        />
                    </div>
                    <div>
                        <button className='login-button' onClick={handleLogin}>
                            登&nbsp;&nbsp;&nbsp;&nbsp;录
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
