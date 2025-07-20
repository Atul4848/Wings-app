import { Typography, withStyles } from '@material-ui/core';
import React, { FC, useEffect, useState } from 'react';
import { Scrollable } from '@uvgo-shared/scrollable';
import { styles } from './UserServiceNProduct.style';
import { UserServicesNProductsModel } from '../../../Shared';
import { IClasses } from '@wings-shared/core';
import { Collapsable } from '@wings-shared/layout';

type ProductNServices = {
  product: string;
  services: string[];
};

interface Props {
  classes?: IClasses;
  servicesNProducts: UserServicesNProductsModel[];
}

const UserServiceNProduct: FC<Props> = ({ classes, servicesNProducts }: Props) => {
  const [ productNServices, setProductNServices ] = useState([]);

  useEffect(() => {
    const productsAndServices = [];
    servicesNProducts.forEach(
      (element: UserServicesNProductsModel, index: number, self: UserServicesNProductsModel[]) => {
        if (!productsAndServices.some(x => x.product === element.product)) {
          const services = self
            .filter(
              (userProfile: UserServicesNProductsModel) =>
                userProfile.product === element.product && userProfile.service !== null && userProfile.service !== ''
            )
            .map((userProfile: UserServicesNProductsModel) => userProfile.service);

          productsAndServices.push({
            product: element.product,
            services: services,
          });
        }
      }
    );
    productsAndServices.sort((p1, p2) => p2.services.length - p1.services.length);
    setProductNServices(productsAndServices);
  }, []);

  return (
    <>
      <div className={classes.detailList}>
        {productNServices.map((productNService: ProductNServices, index: number) => {
          return (
            <Collapsable key={index} defaultExpanded={false} title={productNService.product} titleVariant="subtitle1">
              <div>
                {productNService.services.length ? (
                  productNService.services.map((serviceName: string, serviceIndex: number) => (
                    <Typography key={serviceIndex} className={classes.detailText}>
                      {serviceName}
                    </Typography>
                  ))
                ) : (
                  <div className={classes.noServices}>No services available</div>
                )}
              </div>
            </Collapsable>
          );
        })}
      </div>
    </>
  );
};

export default withStyles(styles)(UserServiceNProduct);
