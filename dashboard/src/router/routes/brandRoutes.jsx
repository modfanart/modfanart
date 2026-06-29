// src/routes/brandRoutes.js
import BrandDetailsPage from "../../concepts/brands/BrandDetailsPage";
import BrandFormPage from "../../concepts/brands/BrandFormPage";
import BrandVerificationWorkflowPage from "../../concepts/brands/BrandVerificationWorkflow";

export const brandRoutes = [
  {
    path: "/brand/:id",
    name: "Brand Details",
    element: <BrandDetailsPage />,
    isSidebarActive: true,
  },
  {
    path: "/brand/create",
    name: "Create Brand",
    element: <BrandFormPage />,
    isSidebarActive: true,
  },
  {
    path: "/brand/:id/edit",
    name: "Edit Brand",
    element: <BrandFormPage />,
    isSidebarActive: true,
  },
  {
    path: "/brand/:id/verification-workflow",
    name: "Edit Brand",
    element: <BrandVerificationWorkflowPage />,
    isSidebarActive: true,
  }
];