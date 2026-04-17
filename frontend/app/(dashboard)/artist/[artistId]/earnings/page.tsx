'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  DollarSign,
  Download,
  CreditCard,
  History,
  ArrowUpRight,
  Filter,
  Calendar,
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-picker';
const earningsChartConfig = {
  total: {
    label: 'Earnings',
    color: 'hsl(var(--chart-1))', // Uses shadcn's built-in chart colors
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  Standard: {
    label: 'Standard',
    color: 'hsl(var(--chart-1))',
  },
  Commercial: {
    label: 'Commercial',
    color: 'hsl(var(--chart-2))',
  },
  Premium: {
    label: 'Premium',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};
export default function EarningsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  // Mock data for earnings
  const recentTransactions = [
    {
      id: 'TX-1234',
      date: 'Mar 5, 2025',
      amount: '$125.00',
      status: 'Paid',
      source: 'Artwork License: Cosmic Hero',
      type: 'License Fee',
    },
    {
      id: 'TX-1233',
      date: 'Mar 1, 2025',
      amount: '$75.50',
      status: 'Paid',
      source: 'Artwork License: Forest Guardian',
      type: 'License Fee',
    },
    {
      id: 'TX-1232',
      date: 'Feb 25, 2025',
      amount: '$220.00',
      status: 'Paid',
      source: 'Commercial Use: Space Explorer',
      type: 'Commercial License',
    },
    {
      id: 'TX-1231',
      date: 'Feb 18, 2025',
      amount: '$45.00',
      status: 'Paid',
      source: 'Artwork License: Ocean Defender',
      type: 'License Fee',
    },
    {
      id: 'TX-1230',
      date: 'Feb 10, 2025',
      amount: '$150.00',
      status: 'Paid',
      source: 'Premium Subscription',
      type: 'Subscription',
    },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Earnings</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DateRangePicker date={dateRange} onDateChange={setDateRange} placeholder="Date Range" />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,245.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$250.00</div>
                <p className="text-xs text-muted-foreground">Processing 2 transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$890.50</div>
                <p className="text-xs text-muted-foreground">Available now</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Licensed Artworks</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="pb-3">
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your earnings over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={earningsChartConfig} className="aspect-[3/2]">
                  <LineChart
                    data={[
                      { name: 'Oct', total: 220 },
                      { name: 'Nov', total: 380 },
                      { name: 'Dec', total: 475 },
                      { name: 'Jan', total: 520 },
                      { name: 'Feb', total: 590 },
                      { name: 'Mar', total: 615 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader className="pb-3">
                <CardTitle>Revenue by License Type</CardTitle>
                <CardDescription>Distribution of your earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="aspect-[3/2]">
                  <BarChart
                    data={[
                      { name: 'Standard', total: 580 },
                      { name: 'Commercial', total: 420 },
                      { name: 'Premium', total: 245 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="total" fill="var(--color-Standard)" radius={4} />{' '}
                    {/* Repeat <Bar /> for multiple series if needed */}
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent earnings activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start space-x-4 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{transaction.source}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="font-medium">{transaction.amount}</div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          transaction.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A complete record of your earnings</CardDescription>
              <div className="flex items-center space-x-2 pt-4">
                <Input placeholder="Search transactions..." className="max-w-sm" />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted p-4 text-sm font-medium">
                  <div>Transaction ID</div>
                  <div>Date</div>
                  <div>Source</div>
                  <div>Type</div>
                  <div className="text-right">Amount</div>
                </div>
                {recentTransactions.concat(recentTransactions).map((transaction, i) => (
                  <div
                    key={`${transaction.id}-${i}`}
                    className="grid grid-cols-5 border-t p-4 text-sm"
                  >
                    <div className="font-medium">{transaction.id}</div>
                    <div>{transaction.date}</div>
                    <div>{transaction.source}</div>
                    <div>{transaction.type}</div>
                    <div className="text-right font-medium">{transaction.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <Button variant="outline">Previous</Button>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your completed payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 bg-muted p-4 text-sm font-medium">
                  <div>Payout ID</div>
                  <div>Date</div>
                  <div>Method</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="grid grid-cols-4 border-t p-4 text-sm">
                  <div className="font-medium">PO-5678</div>
                  <div>Feb 28, 2025</div>
                  <div>Bank Transfer</div>
                  <div className="text-right font-medium">$350.00</div>
                </div>
                <div className="grid grid-cols-4 border-t p-4 text-sm">
                  <div className="font-medium">PO-5677</div>
                  <div>Jan 31, 2025</div>
                  <div>Bank Transfer</div>
                  <div className="text-right font-medium">$275.50</div>
                </div>
                <div className="grid grid-cols-4 border-t p-4 text-sm">
                  <div className="font-medium">PO-5676</div>
                  <div>Dec 31, 2024</div>
                  <div>PayPal</div>
                  <div className="text-right font-medium">$420.00</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-4">
              <Button className="w-full">Request Payout</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payout options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-6 w-6" />
                    <div>
                      <p className="font-medium">Bank Account (Primary)</p>
                      <p className="text-sm text-muted-foreground">Ending in 4567</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>Configure your payout preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Automatic Payout Threshold</Label>
                <Select defaultValue="100">
                  <SelectTrigger id="threshold">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">$50.00</SelectItem>
                    <SelectItem value="100">$100.00</SelectItem>
                    <SelectItem value="250">$250.00</SelectItem>
                    <SelectItem value="500">$500.00</SelectItem>
                    <SelectItem value="1000">$1,000.00</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Earnings will be automatically paid out when they reach this amount
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Payout Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
