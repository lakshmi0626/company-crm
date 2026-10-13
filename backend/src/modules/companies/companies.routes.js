const crud = require('../../utils/crudFactory');

module.exports = crud({
  entity: 'company',
  table: 'companies',
  fields: ['name', 'industry', 'website', 'phone', 'address', 'size', 'owner_id'],
  required: ['name'],
  search: ['t.name', 't.industry', 't.website', 't.phone'],
  filters: [{ param: 'industry', column: 't.industry' }],
  from: 'companies t LEFT JOIN users u ON u.id = t.owner_id',
  columns: 't.*, u.name AS owner_name',
  orderBy: 't.name ASC',
  ownerCol: 'owner_id',
  labelField: 'name',
});
