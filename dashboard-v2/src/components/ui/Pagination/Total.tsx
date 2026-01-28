const Total = (props: { total: number }) => {
    const { total } = props
    return (
        <div className="pagination-total">
            مجموع <span>{total}</span> آیتم
        </div>
    )
}

export default Total
