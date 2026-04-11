import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

export default function Admin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://oadiscussion.onrender.com/api/experience/admin/reported", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        silent: true,
      })
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const dismiss = (id) => {
    setData((prev) => prev.filter((d) => d._id !== id));
    toast.success("Report dismissed");
  };

  const remove = async (id) => {
    try {
      await axios.delete(
        `https://oadiscussion.onrender.com/api/experience/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setData((prev) => prev.filter((d) => d._id !== id));
      toast.success("Post removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-5xl mx-auto pt-8 pb-24 px-6"
    >
      <h1 className="text-4xl font-black text-white tracking-tight mb-2">
        Admin Dashboard
      </h1>
      <p className="text-[#adaaaa] mb-8">Manage reported content</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-[#131313] rounded-2xl p-12 border border-[#484847]/10 text-center">
          <span className="material-symbols-outlined text-[#ff9f4a] text-5xl mb-4">verified_user</span>
          <p className="text-[#adaaaa] mt-4">No reported content</p>
        </div>
      ) : (
        <div className="bg-[#131313] rounded-2xl overflow-hidden border border-[#484847]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#484847]/10">
                  <th className="text-[10px] uppercase tracking-widest text-[#adaaaa] px-6 py-4 font-bold">Company</th>
                  <th className="text-[10px] uppercase tracking-widest text-[#adaaaa] px-6 py-4 font-bold">Reported By</th>
                  <th className="text-[10px] uppercase tracking-widest text-[#adaaaa] px-6 py-4 font-bold">Reason</th>
                  <th className="text-[10px] uppercase tracking-widest text-[#adaaaa] px-6 py-4 font-bold">Date</th>
                  <th className="text-[10px] uppercase tracking-widest text-[#adaaaa] px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#484847]/5">
                {data.map((d) => (
                  <tr key={d._id} className="hover:bg-[#201f1f] transition-colors">
                    <td className="px-6 py-4 text-white font-bold">{d.company || "N/A"}</td>
                    <td className="px-6 py-4 text-[#adaaaa] text-sm">{d.reportedBy?.email || "Unknown"}</td>
                    <td className="px-6 py-4 text-[#adaaaa] text-sm max-w-[200px] truncate">{d.reason || "—"}</td>
                    <td className="px-6 py-4 text-[#767575] text-xs">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => dismiss(d._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#201f1f] text-[#adaaaa] hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => remove(d._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/30 transition-colors"
                        >
                          Remove Post
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
