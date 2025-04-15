
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrganizationManager } from "@/components/admin/OrganizationManager";

const OrganizationPage = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <OrganizationManager />
      </div>
    </AppLayout>
  );
};

export default OrganizationPage;
