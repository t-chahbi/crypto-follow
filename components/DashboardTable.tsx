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
    { name: "RANG", uid: "rank" },
    { name: "NOM", uid: "name" },
    { name: "PRIX", uid: "price" },
    { name: "VAR. 24H", uid: "change" },
    { name: "CAP. MARCHÉ", uid: "market_cap" },
    { name: "ACTIONS", uid: "actions" },
];

export default function DashboardTable({ assets }: { assets: any[] }) {
    const renderCell = (asset: any, columnKey: React.Key) => {
        switch (columnKey) {
            case "rank":
                return <div className="text-default-400">#{asset.rank}</div>;
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png` }}
                        description={asset.symbol}
                        name={asset.name}
                    >
                        {asset.symbol}
                    </User>
                );
            case "price":
                return (
                    <div className="font-mono font-bold">
                        ${asset.price_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                );
            case "change":
                return (
                    <Chip
                        className="capitalize"
                        color={asset.change_percent_24h >= 0 ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {asset.change_percent_24h?.toFixed(2)}%
                    </Chip>
                );
            case "market_cap":
                return (
                    <div className="text-default-400">
                        ${(asset.market_cap_usd / 1e9).toFixed(2)}B
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Détails">
                            <Link href={`/crypto/${asset.symbol}`} className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-indigo-400 transition-colors">
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
        <Table aria-label="Tableau des cryptomonnaies" selectionMode="none">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={assets}>
                {(item) => (
                    <TableRow key={item.symbol}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
