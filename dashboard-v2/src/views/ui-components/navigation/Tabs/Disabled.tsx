import Tabs from '@/components/ui/Tabs'

const { TabNav, TabList } = Tabs

const Disabled = () => {
    return (
        <div>
            <Tabs defaultValue="tab1" className="mb-4">
                <TabList>
                    <TabNav value="tab1">خانه</TabNav>
                    <TabNav disabled value="tab2">
                        پروفایل
                    </TabNav>
                    <TabNav value="tab3">تماس</TabNav>
                </TabList>
            </Tabs>
            <Tabs defaultValue="tab1" variant="pill">
                <TabList>
                    <TabNav value="tab1">خانه</TabNav>
                    <TabNav disabled value="tab2">
                        پروفایل
                    </TabNav>
                    <TabNav value="tab3">تماس</TabNav>
                </TabList>
            </Tabs>
        </div>
    )
}

export default Disabled
