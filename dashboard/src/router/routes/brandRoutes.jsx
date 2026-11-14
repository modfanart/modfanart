// src/routes/brandRoutes.js
import BrandDetailsPage from "../../concepts/brands/BrandDetailsPage";
import BrandFormPage from "../../concepts/brands/BrandFormPage";
import BrandVerificationWorkflowPage from "../../concepts/brands/BrandVerificationWorkflow";
import BrandVerificationRequestsPage from "../../concepts/brands/BrandVerificationRequestsPage";

export const brandRoutes = [
  {
    path: "/brands/requests",
    name: "Verification Requests",
    element: <BrandVerificationRequestsPage />,
    isSidebarActive: true,
  },
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
    name: "Verification Workflow",
    element: <BrandVerificationWorkflowPage />,
    isSidebarActive: true,
  },
];
