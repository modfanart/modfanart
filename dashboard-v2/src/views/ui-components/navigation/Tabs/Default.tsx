import Tabs from '@/components/ui/Tabs'

const { TabNav, TabList, TabContent } = Tabs

const Default = () => {
    return (
        <div>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">خانه</TabNav>
                    <TabNav value="tab2">پروفایل</TabNav>
                    <TabNav value="tab3">تماس</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                        <p>
                            اگر سازندگان ساختمان‌ها را همان‌طور که برنامه‌نویسان کد می‌نویسند می‌ساختند،
                            اولین دارکوبی که می‌آمد تمدن را نابود می‌کرد. (جرالد واینبرگ)
                        </p>
                    </TabContent>
                    <TabContent value="tab2">
                        <p>
                            یک کامپیوتر به شما این امکان را می‌دهد که اشتباهات بیشتری را سریع‌تر از هر اختراع دیگری
                            در تاریخ بشر مرتکب شوید، با احتمال استثناهایی مثل تفنگ‌های دستی و تکیلا. (مچ ردفیلد)
                        </p>
                    </TabContent>
                    <TabContent value="tab3">
                        <p>
                            در C++ سخت‌تر است که خودتان را در پا شلیک کنید، اما وقتی این کار را می‌کنید،
                            تمام پای خود را از دست می‌دهید. (بیارنه استروستروپ)
                        </p>
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

export default Default
