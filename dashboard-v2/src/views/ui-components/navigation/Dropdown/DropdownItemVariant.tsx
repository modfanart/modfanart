import Dropdown from '@/components/ui/Dropdown'

const HeaderDivider = () => {
    return (
        <div>
            <Dropdown title="کلیک کن!">
                <Dropdown.Item variant="header">
                    <div className="pt-3 pb-1 px-3">
                        <span>وارد شده به عنوان</span>
                        <div className="font-semibold mt-1 text-gray-800 dark:text-white">
                            alex_g@theme_nate.com
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item>آیتم A</Dropdown.Item>
                <Dropdown.Item>آیتم B</Dropdown.Item>
                <Dropdown.Item>آیتم C</Dropdown.Item>
                <Dropdown.Item>آیتم D</Dropdown.Item>
                <Dropdown.Item variant="custom">
                    <div
                        className="
                        cursor-pointer 
                        px-3 
                        py-2 
                        text-indigo-600 
                        font-semibold 
                        hover:bg-gray-100 
                        dark:hover:bg-black 
                        dark:hover:bg-opacity-20
                    "
                    >
                        آیتم سفارشی منوی کشویی
                    </div>
                </Dropdown.Item>
            </Dropdown>
        </div>  
    )
}

export default HeaderDivider
