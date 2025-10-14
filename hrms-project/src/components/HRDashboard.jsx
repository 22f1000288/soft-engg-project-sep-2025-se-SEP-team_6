const HRDashboard = (props) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">HR Dashboard</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Candidate Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Candidate Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applied Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {props.applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{app.candidateName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{app.email}</td>
                  <td className="px-4 py-3 text-sm">{app.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{app.appliedDate}</td>
                  <td className="px-4 py-3 text-sm">{props.getStatusBadge(app.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  export default HRDashboard;