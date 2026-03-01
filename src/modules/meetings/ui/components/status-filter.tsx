import {
    CircleXIcon,
    CircleCheckIcon,
    ClockArrowUpIcon,
    VideoIcon,
    LoaderIcon,
} from "lucide-react";

import { CommandSelect } from "@/components/command-select";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

const options = [{
    id: "upcoming",
    value: "upcoming",
    children: (
        <div className="flex items-center gap-x-2 capitalize">
           <ClockArrowUpIcon /> 
           Upcoming
        </div>
    )
},
{
    id: "completed",
    value: "completed",
    children: (
        <div className="flex items-center gap-x-2 capitalize">
            <CircleCheckIcon />
            Completed
        </div>
    ),
},
{
    id: "active",
    value: "active",
    children: (
        <div className="flex items-center gap-x-2 capitalize">
            <VideoIcon />
            Active
        </div>
    ),
},
{
    id: "processing",
    value: "processing",
    children: (
        <div className="flex items-center gap-x-2 capitalize">
            <LoaderIcon />
            Processing
        </div>
    ),
},
{
    id: "cancelled",
    value: "cancelled",
    children: (
        <div className="flex items-center gap-x-2 capitalize">
            <CircleXIcon />
            Cancelled
        </div>
    ),
},
];
export const StatusFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();

    return (
        <CommandSelect 
          placeholder="Status"
          className="h-9"
          options={options}
          onSelect={(value) => setFilters({ status: value })}
          value={filters.status ?? ""}
        />
    );
};
