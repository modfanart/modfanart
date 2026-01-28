import AuthorityCheck from '@/components/shared/AuthorityCheck'

const Example = () => {
    const permissionRole = ['مدیر', 'کاربر']

    const users = [
        {
            name: 'کاربر A',
            roles: ['مدیر', 'کاربر'],
            color: 'text-indigo-500',
        },
        {
            name: 'کاربر B',
            roles: ['کاربر'],
            color: 'text-emerald-500',
        },
        {
            name: 'کاربر C',
            roles: ['مهمان'],
            color: 'text-rose-500',
        },
        {
            name: 'کاربر D',
            roles: ['مدیر', 'کاربر'],
            color: 'text-blue-500',
        },        
    ]

    return (
        <>
            <h6 className="mb-4">کاربران با نقش‌های مختلف</h6>
            <div className="flex flex-col gap-2">
                {users.map((user, index) => (
                    <div key={index}>
                        <span className={user.color}>{user.name}</span>: {` `}
                        <span className="font-semibold">
                            {user.roles.toString()}
                        </span>
                    </div>
                ))}
            </div>
            <hr className="my-4" />
            <div className="mb-4">
                <span>نقش‌هایی که می‌توانند دسترسی داشته باشند: {` `}</span>
                <span className="font-semibold">
                    {permissionRole.toString()}
                </span>
            </div>
            <div>
                <span>نتیجه (کاربرانی که قادر به دسترسی هستند): </span>
                {users.map((user) => (
                    <AuthorityCheck
                        key={user.name}
                        authority={permissionRole}
                        userAuthority={user.roles}
                    >
                        <span className={`${user.color} font-semibold`}>
                            {user.name},{' '}
                        </span>
                    </AuthorityCheck>
                ))}
            </div>
        </>
    )
}


export default Example
