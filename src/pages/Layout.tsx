import React, { useState } from "react";
import {
  DatabaseFilled,
  DesktopOutlined,
  LoginOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { useNavigate, Outlet } from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("LOGO", "2", <DesktopOutlined />),
  getItem("Quản lý dữ liệu", "sub1", <DatabaseFilled />, [
    getItem("Người dùng", "nguoi-dung", <UserOutlined />),
    getItem("Mail", "mail", <MailOutlined />),
  ]),
  getItem("Đăng nhập", "auth/login", <LoginOutlined />),
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh", marginTop: 16 }}>
      <Sider
        theme="light"
        width={300}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="light"
          defaultOpenKeys={["categories"]}
          mode="inline"
          items={items}
          onSelect={(item) => {
            console.log(item);
            navigate(item.key);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div>
            <h3 className="text-center">TRANG QUẢN LÝ</h3>
          </div>
        </Header>
        <Content style={{ margin: "0 16px", marginTop: "12px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Trang quản lý Online Shop by Minh Phan
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
