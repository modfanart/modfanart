// src/routes/brandRoutes.js
import { SignIn, WarningCircle } from "@phosphor-icons/react";
import BrandDetailsPage from "../../concepts/brands/BrandDetailsPage";
import BrandFormPage from "../../concepts/brands/BrandFormPage";


const iconProps = {
  size: 20,
  weight: "duotone",
};

export const brandRoutes = [
  {
    path: "/brand/:id",
    name: "Brand Details",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <BrandDetailsPage />,
  },
{
    path: "/brand/create", name: "Brand Add",     icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <BrandFormPage />,
},
{
    path: "/brand/:id/edit", name: "Brand Add",     icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <BrandFormPage />,
}
];