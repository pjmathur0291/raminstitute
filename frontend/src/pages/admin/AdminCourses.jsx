import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { BookOpen, Clock } from "lucide-react";

export default function AdminCourses() {
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/courses").then(r => r.data),
  });

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-700">Courses</h1>
        <p className="text-sm text-gray-500">Currently published academic programs. Full CRUD coming in next release.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map((c) => (
          <div key={c.slug} className="bg-white border border-gray-200 rounded-sm p-5" data-testid={`admin-course-${c.slug}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-burgundy-50 text-burgundy-500 rounded-sm flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold bg-gold-500 text-burgundy-900 px-2 py-0.5 rounded-sm">{c.level}</span>
                  {c.is_active && <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">Active</span>}
                </div>
                <p className="font-display text-lg font-bold text-burgundy-700 leading-tight">{c.title}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{c.overview}</p>
                <div className="flex gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration}</span>
                  <span className="flex items-center gap-1 capitalize"><BookOpen className="w-3 h-3" /> {c.level}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
