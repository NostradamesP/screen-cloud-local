import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

export default function Calendar() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    api.schedules.list().then(setSchedules).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString("es", { month: "long", year: "numeric" });

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return schedules.filter((s: any) => {
      if (!s.active) return false;
      if (s.daysOfWeek && !s.daysOfWeek.includes(new Date(year, month, day).getDay())) return false;
      if (s.startDate && dateStr < s.startDate) return false;
      if (s.endDate && dateStr > s.endDate) return false;
      return true;
    });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="min-h-[80px] bg-gray-50/50 rounded" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const daySchedules = getSchedulesForDay(d);
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    cells.push(
      <div key={d} className={`min-h-[80px] border rounded p-1 ${isToday ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
        <span className={`text-xs font-medium ${isToday ? "text-brand-700" : "text-gray-500"}`}>{d}</span>
        <div className="space-y-0.5 mt-1">
          {daySchedules.slice(0, 3).map((s: any, i: number) => (
            <div key={s.id} className="text-[10px] px-1 py-0.5 rounded truncate text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
              {s.name}
            </div>
          ))}
          {daySchedules.length > 3 && <div className="text-[10px] text-gray-400">+{daySchedules.length - 3} más</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-medium capitalize min-w-[180px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}
