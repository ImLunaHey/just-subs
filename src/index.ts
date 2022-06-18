import am from 'am';
import { logger } from '@app/common/logger';

const main = async () => {
    
};

am(main, error => {
    logger.error('Failed to start application with "%s"', error);
});
