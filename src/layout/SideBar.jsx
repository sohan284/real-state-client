import { Layout, Menu } from "antd";
import { adminPaths } from "../routes/admin.routes";
import { ownerPaths } from "../routes/owner.routes";
import { tenantPaths } from "../routes/tenant.routes";
import { sidebarItemGenerator } from "../utils/sidebarItemGenerator";
import { useAppSelector } from "../redux/hooks";
import { useCurrentToken } from "../redux/fetures/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import logo from './../assets/logo.svg'

const { Sider } = Layout;

const userRole = {
  ADMIN: "admin",
  OWNER: "owner",
  TENENT: "tenant",
};

const SideBar = () => {
  const token = useAppSelector(useCurrentToken);
  const navigate = useNavigate();

  let user;
  if (token) {
    user = jwtDecode(token);
  }

  if (!token) {
    navigate("/signin");
  }

  let sideBarItems;

  switch (user?.role) {
    case userRole.ADMIN:
      sideBarItems = sidebarItemGenerator(adminPaths, userRole.ADMIN);
      break;
    case userRole.OWNER:
      sideBarItems = sidebarItemGenerator(ownerPaths, userRole.OWNER);
      break;
    case userRole.TENENT:
      sideBarItems = sidebarItemGenerator(tenantPaths, userRole.TENENT);
      break;

    default:
      break;
  }

  return (
    <Sider
      style={{
        height: "100vh",
        width: "278px",
        position: "sticky",
        top: "0",
        left: "0",
        backgroundColor: "#1C2434",
      }}
      breakpoint="lg"
      collapsedWidth="0"
    >
      <Link to="/"
        style={{
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1C2434",
        }}
        className="flex items-center gap-2"
      >
        <img src={logo} alt="" className="h-7 w-7" />
        <span className="text-[20px] font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#aaaaaa] bg-clip-text text-transparent tracking-[-0.88px]">RentPad Homes</span>
      </Link>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["4"]}
        items={sideBarItems}
      />
    </Sider>
  );
};

export default SideBar;
