const reportService = require('../services/reportService');

class ReportController {
  async exportCsv(req, res, next) {
    try {
      const params = req.method === 'POST' ? req.body : req.query;
      const csvData = await reportService.generateSalaryCsv(params);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `salary_report_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
