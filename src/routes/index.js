// Imports
import { Router } from 'express';

import taskRoutes from './tasks';

// Express router setup
const frontendRoutes = Router();

// Route delegation
frontendRoutes.use('/tasks', taskRoutes);

// Redirect home page to task listing
frontendRoutes.get('/', (req, res) => res.redirect(301, '/tasks'));

// Exports
export default frontendRoutes;
