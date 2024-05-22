import './NotFound.scss';
import { useTranslation } from 'react-i18next';

function NotFound404() {

    const { t } = useTranslation();

    return (
        <div className='not-found'>
            {t("not_found")}
        </div>
    )
}

export default NotFound404;