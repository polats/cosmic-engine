const DegenCard = (degen: string) => {
    // const degenValue = parseInt(value);
    console.log("degen: ", degen)
    return (
        <div className="text-4xl font-bold bg-[#B053AA]">
            {degen} WEI
        </div>
    )
}

export default DegenCard;