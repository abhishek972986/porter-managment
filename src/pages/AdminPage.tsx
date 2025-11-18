import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { PortersAdmin } from '@/components/admin/PortersAdmin';
import { LocationsAdmin } from '@/components/admin/LocationsAdmin';
import { CommuteCostsAdmin } from '@/components/admin/CommuteCostsAdmin';
import { CarriersAdmin } from '@/components/admin/CarriersAdmin';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
        <p className="text-gray-600 mt-1">Manage porters, locations, carriers, and commute costs</p>
      </div>

      <Tabs defaultValue="porters">
        <TabsList>
          <TabsTrigger value="porters">Porters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="costs">Commute Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="porters">
          <PortersAdmin />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsAdmin />
        </TabsContent>

        <TabsContent value="carriers">
          <CarriersAdmin />
        </TabsContent>

        <TabsContent value="costs">
          <CommuteCostsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
};

