const CandidateDashboard = (props) => {
    const userApplication = props.applications.find(app => app.email === props.loggedInUser.email);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Candidate Dashboard</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Application Status</h3>
          {userApplication ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Position Applied</p>
                  <p className="text-lg font-semibold">{userApplication.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Application Date</p>
                  <p className="text-lg font-semibold">{userApplication.appliedDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                {props.getStatusBadge(userApplication.status)}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {userApplication.status === 'under-review' && 'Your application is currently being reviewed by our HR team. You will be notified of any updates.'}
                  {userApplication.status === 'approved' && 'Congratulations! Your application has been approved. Our HR team will contact you soon.'}
                  {userApplication.status === 'rejected' && 'Thank you for your interest. Unfortunately, we are moving forward with other candidates at this time.'}
                  {userApplication.status === 'pending' && 'Your application has been received and will be reviewed shortly.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No application found. Please apply for a position to track your status.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default CandidateDashboard;