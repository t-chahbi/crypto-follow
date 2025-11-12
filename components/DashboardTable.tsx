'use client'

import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
} from "@heroui/react";
import Link from "next/link";
import { Eye } from "lucide-react";

const columns = [
    { name: "RANG", uid: "market_cap_rank" },
    { name: "NOM", uid: "name" },
    { name: "PRIX", uid: "current_price" },
    { name: "VAR. 24H", uid: "price_change_percentage_24h" },
    { name: "CAP. MARCHÉ", uid: "market_cap" },
    { name: "ACTIONS", uid: "actions" },
];

export default function DashboardTable({ assets }: { assets: any[] }) {
    const renderCell = (asset: any, columnKey: React.Key) => {
        switch (columnKey) {
            case "market_cap_rank":
                return <div className="text-default-400">#{asset.market_cap_rank}</div>;
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: asset.image }}
                        description={asset.symbol.toUpperCase()}
                        name={asset.name}
                    >
                        {asset.symbol}
                    </User>
                );
            case "current_price":
                return (
                    <div className="font-mono font-bold">
                        ${asset.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                );
            case "price_change_percentage_24h":
                return (
                    <Chip
                        className="capitalize"
                        color={asset.price_change_percentage_24h >= 0 ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {asset.price_change_percentage_24h?.toFixed(2)}%
                    </Chip>
                );
            case "market_cap":
                return (
                    <div className="text-default-400">
                        ${(asset.market_cap / 1e9).toFixed(2)}B
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Détails">
                            <Link href={`/crypto/${asset.id}`} className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-indigo-400 transition-colors">
                                <Eye size={20} />
                            </Link>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Table aria-label="Tableau des cryptomonnaies" selectionMode="none" classNames={{
            wrapper: "bg-white/5 border border-white/10",
            th: "bg-white/10 text-default-500",
            td: "group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none"
        }}>
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={assets}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
