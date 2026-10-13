const crud = require('../../utils/crudFactory');

module.exports = crud({
  entity: 'contact',
  table: 'contacts',
  fields: ['first_name', 'last_name', 'email', 'phone', 'job_title', 'company_id', 'owner_id'],
  required: ['first_name'],
  search: ['t.first_name', 't.last_name', 't.email', 't.phone', 'co.name'],
  filters: [{ param: 'company_id', column: 't.company_id' }],
  from: `contacts t
         LEFT JOIN companies co ON co.id = t.company_id
         LEFT JOIN users u ON u.id = t.owner_id`,
  columns: `t.*, TRIM(t.first_name || ' ' || COALESCE(t.last_name, '')) AS full_name,
            co.name AS company_name, u.name AS owner_name`,
  orderBy: 't.first_name ASC, t.last_name ASC',
  ownerCol: 'owner_id',
  labelField: 'full_name',
});
