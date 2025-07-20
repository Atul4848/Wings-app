import React, { FC, useState } from 'react';
import { Avatar, Box, Checkbox, Grid, Tooltip, Typography, useTheme, withStyles } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AddressBookIcon, AirplaneIcon, EditIcon, SearchIcon, TrashIcon, UserIconDarkIcon } from '@uvgo-shared/icons';
import PersonIcon from '@material-ui/icons/Person';
import { IClasses } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { styles } from './CustomList.style';
import MailRoundedIcon from '@material-ui/icons/MailRounded';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalPhoneRoundedIcon from '@material-ui/icons/LocalPhoneRounded';
import DownloadIcon from '@material-ui/icons/GetApp';
import moment from 'moment';
import { ModeStore } from '@wings-shared/mode-store';
import { LocationCity } from '@material-ui/icons';
import Help from '@material-ui/icons/Help';

type Props = {
  classes: IClasses;
  colDef: any[];
  rowData: any[];
  isHeaderVisible?: boolean;
  onEdit?: (value: any, e: any) => void;
  onDetails?: (value: any, e: any) => void;
  onDownload?: (value: any) => void;
  onDelete?: (value: any) => void;
  isContact?: boolean;
  isLocation?: boolean;
  isVendors?: boolean;
  isVendorAddress?: boolean;
  showEditButton?: boolean;
  isVendorDocument?: boolean;
  isAirportBulletins?: boolean;
  showDetailButton?: boolean;
  showDeleteButton?: boolean;
  isVendorLocationDocument?: boolean;
  isLocationSelected?: (value: any) => void;
  selectedItemId?: number;
  isLoading?: boolean;
  isVendorUser?: boolean;
  isHandlerEvents?: boolean;
  openPopupModel?: () => void;
};

const CustomList: FC<Props> = ({
  classes,
  colDef,
  rowData,
  isHeaderVisible,
  onEdit,
  onDetails,
  onDownload,
  onDelete,
  showDeleteButton,
  isContact,
  isLocation,
  isVendors,
  isVendorAddress,
  showEditButton,
  isLocationSelected,
  selectedItemId,
  isVendorDocument,
  isVendorLocationDocument,
  isLoading,
  isAirportBulletins,
  showDetailButton,
  isVendorUser,
  isHandlerEvents,
  openPopupModel
}) => {
  return renderGridList({
    classes,
    colDef,
    rowData,
    isHeaderVisible,
    onEdit,
    onDetails,
    onDownload,
    onDelete,
    isContact,
    showDeleteButton,
    isLocation,
    isVendors,
    isVendorAddress,
    showEditButton,
    isLocationSelected,
    selectedItemId,
    isVendorLocationDocument,
    isVendorDocument,
    isLoading,
    isAirportBulletins,
    showDetailButton,
    isVendorUser,
    isHandlerEvents,
    openPopupModel
  });
};

const htmltoText = (html: string) => {
  let text = html;
  text = text?.replace(/\n/gi, '');
  text = text?.replace(/<style([\s\S]*?)<\/style>/gi, '');
  text = text?.replace(/<script([\s\S]*?)<\/script>/gi, '');
  text = text?.replace(/<a.*?href='(.*?)[\\?\\'].*?>(.*?)<\/a.*?>/gi, ' $2 $1 ');
  text = text?.replace(/<\/div>/gi, '\n\n');
  text = text?.replace(/<\/li>/gi, '\n');
  text = text?.replace(/<li.*?>/gi, '  *  ');
  text = text?.replace(/<\/ul>/gi, '\n\n');
  text = text?.replace(/<\/p>/gi, '\n\n');
  text = text?.replace(/<br\s*[\\/]?>/gi, '\n');
  text = text?.replace(/<[^>]+>/gi, '');
  text = text?.replace(/^\s*/gim, '');
  text = text?.replace(/ ,/gi, ',');
  text = text?.replace(/ +/gi, ' ');
  text = text?.replace(/\n+/gi, '\n\n');
  return text;
};

function getNestedPropertyValue(item, field) {
  const properties = field?.split('.');
  let value = item;
  for (const prop of properties) {
    if (value && value.hasOwnProperty(prop)) {
      value = value[prop];
    } else {
      return '';
    }
  }
  if (value instanceof Array) {
    const vendorLocationNames = value.map((item, index) => {
      const mappedValue = item.vendorLocation.name;
      return (
        <div key={index}>
          <Tooltip title={mappedValue}>
            <Typography
              style={{
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordWrap: 'normal',
                whiteSpace: 'nowrap',
                // color: isDarkMode ? '#FFFFFF' : primaryColor,
                fontSize: '14px',
              }}
            >
              {mappedValue}
              {index !== value.length - 1 && <span>, </span>}
            </Typography>
          </Tooltip>
        </div>
      );
    });
    return vendorLocationNames;
  }
  if (typeof value === 'object' && value !== null) {
    return value?.name;
  }
  if (value === null) {
    return '';
  }
  return htmltoText(value);
}

function camelCase(str) {
  const words = str?.split(' ');
  for (let i = 0; i < words?.length; i++) {
    words[i] = words[i][0]?.toUpperCase() + words[i].substr(1)?.toLowerCase();
  }
  return words?.join(' ');
}

const capitalizeFirstLetter = str => {
  const words = str?.split(' ');
  for (let i = 0; i < words?.length; i++) {
    words[i] = words[i][0]?.toUpperCase() + words[i].substr(1)?.toUpperCase();
  }
  return words?.join(' ');
};

function extractDomain(url) {
  let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  domain = domain?.split('/')[0];
  return domain;
}

const getFirstValidField = (item: any, fields: string | string[]): any => {
  if (typeof fields === 'string') {
    return fields.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  if (Array.isArray(fields)) {
    for (const value of fields) {
      const nestedValue = value.split('.').reduce((acc, part) => acc && acc[part], item);
      if (nestedValue !== undefined && nestedValue !== null) {
        return nestedValue;
      }
    }
  }
  return null;
};

const renderGridList: FC<Props> = ({
  classes,
  colDef,
  rowData,
  isHeaderVisible,
  onEdit,
  onDetails,
  onDownload,
  onDelete,
  isContact,
  showEditButton,
  showDeleteButton,
  isLocation,
  isVendors,
  isVendorAddress,
  isLocationSelected,
  selectedItemId,
  isVendorDocument,
  isVendorLocationDocument,
  isLoading,
  isAirportBulletins,
  showDetailButton,
  isVendorUser,
  isHandlerEvents,
  openPopupModel
}) => {
  const [ hoveredRow, setHoveredRow ] = useState(-1);
  const themes = useTheme();
  const isDarkMode = themes.palette.type == 'dark';
  const primaryColor = '#202020';
  const headerColor = themes.palette.text.primary;

  if (rowData.length === 0) {
    return (
      <Box>
        <Typography align="center" style={{ fontSize: 12 }}>
          No Rows To Show
        </Typography>
      </Box>
    );
  }

  const daysLeftUntilExpiry = lastExpiryDate => {
    if (!ModeStore.isDevModeEnabled) {
      return 'none';
    }
    const currentDate = new Date();
    const expiryDate = new Date(lastExpiryDate);

    const differenceInMilliseconds = expiryDate - currentDate;

    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (differenceInDays <= 7) return '2px solid #DB063B';
    if (differenceInDays > 7 && differenceInDays <= 30) return '2px solid #F2C12C';
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      {isVendorLocationDocument && (
        <Grid container spacing={1} className={classes.fixedHeader}>
          <Grid item xs={2}></Grid>
          <Grid item xs={9}>
            <Grid container className={classes.spaceing} spacing={3} style={{ paddingLeft:'6px' }}>
              <Grid item xs={2} style={{ padding:'0px' }}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '12px',
                    padding:'0px',
                    color: headerColor,
                  }}
                >
                  Other Name
                </Typography>
              </Grid>
              <Grid item xs={2} style={{ padding:'0px' }}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  START DATE
                </Typography>
              </Grid>
              <Grid item xs={3} style={{ padding:'0px' }}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '12px',
                    padding:'0px',
                    color: headerColor,
                  }}
                >
                  EXPIRATION DATE
                </Typography>
              </Grid>
              <Grid item xs={1} style={{ padding:'0px' }}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '12px',
                    padding:'0px',
                    color: headerColor,
                  }}
                >
                  STATUS
                </Typography>
              </Grid>
              <Grid item xs={3} style={{ padding:'0px' }}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '12px',
                    padding:'0px',
                    color: headerColor,
                  }}
                >
                  LAST UPDATED
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      )}
      {isAirportBulletins && (
        <Grid container spacing={1} className={classes.fixedHeader}>
          <Grid item xs={2}>
            <Typography
              style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '12px',
                color: headerColor,
              }}
            >
              Type
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={3} xs={12}>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Start Date
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  End Date
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  NOTAM
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Note description
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
      )}
      {isVendorUser && (
        <Grid container spacing={1} className={classes.fixedHeader}>
          <Grid item xs={3}></Grid>
          <Grid item xs={7}>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: headerColor,
                  }}
                >
                  Email Address
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: headerColor,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  User Role <Help className={classes.helpIcon} onClick={() => openPopupModel()} />
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: headerColor,
                  }}
                >
                  Sms Opt In
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: headerColor,
                  }}
                >
                  Location
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      )}
      {isHandlerEvents && (
        <Grid container spacing={1} className={classes.fixedHeader}>
          <Grid item xs={2}>
            <Typography
              style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '12px',
                color: headerColor,
              }}
            >
              Name
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={3} xs={12}>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Description
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Type
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Category
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  Start Date
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: headerColor,
                  }}
                >
                  End Date
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      )}
      {rowData.map((item, index) => {
        return (
          <Grid
            container
            spacing={1}
            onMouseEnter={() => setHoveredRow(index)}
            onMouseLeave={() => setHoveredRow(-1)}
            onClick={() => ((isLocation || isVendors) ? isLocationSelected(item) : '')}
            key={index}
            className={`${classes.card} ${selectedItemId === item.id ? `${classes.locationSelected}` : ''} `}
            style={{
              // backgroundColor: hoveredRow === index ? '#b6d8fe' : '#ffffff',
              transition: 'background-color 0.1s',
              backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
              transition: 'border 0.1s',
              border:
                hoveredRow === index
                  ? '2px solid #004BA0'
                  : isVendorLocationDocument
                    ? daysLeftUntilExpiry(getNestedPropertyValue(item, colDef[3].field))
                    : '2px solid #00000000',
              minHeight: isAirportBulletins ? '60px' : isHandlerEvents ? '70px' : '90px',
            }}
            justifyContent="space-between"
          >
            <Grid
              item
              xs={
                isVendorDocument || isVendorLocationDocument || isAirportBulletins || isHandlerEvents
                  ? 2
                  : isVendorUser
                    ? 3
                    : isLocation || isVendors || isVendorAddress || isContact
                      ? 7
                      : 4
              }
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Avatar
                style={{
                  backgroundColor: '#2C313D',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  height: isAirportBulletins || isHandlerEvents ? 33 : 53,
                  width: isAirportBulletins || isHandlerEvents ? 33 : 53,
                  marginRight: isHandlerEvents ? '10px' : '8px',
                }}
              >
                {isContact &&
                  (getNestedPropertyValue(item, colDef[3].field) === 'Email' ? (
                    <MailRoundedIcon />
                  ) : getNestedPropertyValue(item, colDef[3].field) === 'Phone' ? (
                    <LocalPhoneRoundedIcon />
                  ) : getNestedPropertyValue(item, colDef[3].field) === 'Website' ? (
                    'WWW'
                  ) : getNestedPropertyValue(item, colDef[3].field) === 'ARINC' ? (
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box style={{ transform: 'rotate(90deg)' }}>
                        <AirplaneIcon />
                      </Box>
                      <Typography align="center" style={{ fontWeight: 'bold', fontSize: 12 }}>
                        ARINC
                      </Typography>
                    </Box>
                  ) : (
                    getNestedPropertyValue(item, colDef[3].field)
                      .substring(0, 4)
                      .toUpperCase()
                  ))}
                {(isLocation || isVendors) && getFirstValidField(item, colDef[0].field)}
                {isVendorAddress && <AddressBookIcon />}
                {(isVendorDocument || isVendorLocationDocument) && <DescriptionIcon />}
                {isAirportBulletins && (
                  <div className="descriptionIcon">
                    <DescriptionIcon />
                  </div>
                )}
                {isHandlerEvents && (
                  <div className="descriptionIcon">
                    <LocationCity />
                  </div>
                )}
                {isVendorUser && (
                  <div className="userIcon">
                    <PersonIcon />
                  </div>
                )}
              </Avatar>
              {isContact && (
                <Tooltip
                  title={`${getNestedPropertyValue(item, colDef[1].field)} ${getNestedPropertyValue(
                    item,
                    colDef[2].field
                  )} ${getNestedPropertyValue(item, colDef[3].field)}: ${getNestedPropertyValue(
                    item,
                    colDef[4].field
                  )}`}
                  arrow
                  placement="bottom"
                >
                  {`${getNestedPropertyValue(item, colDef[3].field)}` === 'Website' ? (
                    <Typography
                      style={{
                        marginRight: '10px',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        // whiteSpace: 'nowrap',
                        // display: 'flex',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${getNestedPropertyValue(item, colDef[1].field)} ${getNestedPropertyValue(
                        item,
                        colDef[2].field
                      )} ${getNestedPropertyValue(item, colDef[3].field)}:`}
                      <Typography
                        component={'p'}
                        style={{
                          color: 'blue',
                          paddingLeft: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordWrap: 'normal',
                          // whiteSpace: 'nowrap',
                        }}
                      >{`${extractDomain(getNestedPropertyValue(item, colDef[4].field))}
                    `}</Typography>
                    </Typography>
                  ) : (
                    <Typography
                      style={{
                        marginRight: '10px',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        // whiteSpace: 'nowrap',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${getNestedPropertyValue(item, colDef[1].field)} ${getNestedPropertyValue(
                        item,
                        colDef[2].field
                      )} ${getNestedPropertyValue(item, colDef[3].field)}: ${getNestedPropertyValue(
                        item,
                        colDef[4].field
                      )} `}
                    </Typography>
                  )}
                </Tooltip>
              )}
              {(isLocation || isVendors) && (
                <Tooltip title={getNestedPropertyValue(item, colDef[1].field)} arrow placement="bottom">
                  <Typography
                    style={{
                      marginRight: '10px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[1].field)}
                  </Typography>
                </Tooltip>
              )}
              {isVendorAddress && (
                <Tooltip title={getNestedPropertyValue(item, colDef[0].field)} arrow placement="bottom">
                  <Typography
                    style={{
                      marginRight: '10px',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[0].field)}
                  </Typography>
                </Tooltip>
              )}
              {(isVendorDocument || isVendorLocationDocument) && (
                <Tooltip title={getNestedPropertyValue(item, colDef[0].field)} arrow placement="bottom">
                  <Typography
                    style={{
                      overflowWrap: 'break-word',
                      marginRight: '10px',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[0].field)}
                  </Typography>
                </Tooltip>
              )}
              {isAirportBulletins && (
                <Tooltip title={getNestedPropertyValue(item, colDef[0].field)} arrow placement="bottom">
                  <Typography
                    style={{
                      marginRight: '10px',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[0].field)}
                  </Typography>
                </Tooltip>
              )}
              {isHandlerEvents && (
                <Tooltip title={getNestedPropertyValue(item, colDef[0].field)} arrow placement="bottom">
                  <Typography
                    style={{
                      marginRight: '10px',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[0].field)}
                  </Typography>
                </Tooltip>
              )}
              {isVendorUser && (
                <Tooltip
                  title={`${camelCase(getNestedPropertyValue(item, colDef[0].field))} ${getNestedPropertyValue(
                    item,
                    colDef[1].field
                  )}`}
                  arrow
                  placement="bottom"
                >
                  <Typography
                    style={{
                      overflowWrap: 'break-word',
                      marginRight: '10px',
                      fontWeight: 600,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    {getNestedPropertyValue(item, colDef[0].field)}
                    <br />
                    {getNestedPropertyValue(item, colDef[1].field)}
                  </Typography>
                </Tooltip>
              )}
            </Grid>
            <Grid
              item
              xs={
                isAirportBulletins || isVendorDocument || isVendorLocationDocument || isHandlerEvents
                  ? 9
                  : isVendorUser
                    ? 7
                    : isLocation || isVendors || isVendorAddress || isContact
                      ? 3
                      : 6
              }
            >
              {isLocation &&
                (getNestedPropertyValue(item, colDef[4].field) ? (
                  <Typography
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: 'center',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    AIRPORT
                  </Typography>
                ) : (
                  <Typography
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: 'center',
                      color: isDarkMode ? '#FFFFFF' : primaryColor,
                    }}
                  >
                    CITY
                  </Typography>
                ))}
              {isVendors && (
                <Typography
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    textAlign: 'center',
                    color: isDarkMode ? '#FFFFFF' : primaryColor,
                    marginBottom: '4px',
                  }}
                >
                  HEADQUARTER
                </Typography>
              )}
              <Typography
                style={{
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordWrap: 'normal',
                  whiteSpace: 'nowrap',
                  fontWeight: '400',
                  fontSize: '14px',
                  color: isDarkMode ? '#FFFFFF' : primaryColor,
                }}
              >
                {isContact && (
                  <Tooltip
                    title={`${
                      getNestedPropertyValue(item, colDef[5].field)
                        ? getNestedPropertyValue(item, colDef[5].field) +
                          (getNestedPropertyValue(item, colDef[6].field) ? ' :' : '')
                        : ''
                    } ${
                      getNestedPropertyValue(item, colDef[6].field) ? getNestedPropertyValue(item, colDef[6].field) : ''
                    }`}
                  >
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${
                        getNestedPropertyValue(item, colDef[5].field)
                          ? getNestedPropertyValue(item, colDef[5].field) +
                            (getNestedPropertyValue(item, colDef[6].field) ? ' :' : '')
                          : ''
                      } ${
                        getNestedPropertyValue(item, colDef[6].field)
                          ? getNestedPropertyValue(item, colDef[6].field)
                          : ''
                      }`}
                    </Typography>
                  </Tooltip>
                )}
                {isLocation && (
                  <Tooltip
                    title={`${camelCase(getFirstValidField(item, colDef[2].field))} - ${getFirstValidField(
                      item,
                      colDef[3].field
                    )}`}
                  >
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${camelCase(getFirstValidField(item, colDef[2].field))} - ${getFirstValidField(
                        item,
                        colDef[3].field
                      )}`}
                    </Typography>
                  </Tooltip>
                )}
                {isVendors && (
                  <Tooltip
                    title={`${camelCase(getFirstValidField(item, colDef[2].field))}(${getFirstValidField(
                      item,
                      colDef[3].field
                    )})`}
                  >
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${camelCase(getFirstValidField(item, colDef[2].field))}(${getFirstValidField(
                        item,
                        colDef[3].field
                      )})`}
                    </Typography>
                  </Tooltip>
                )}
              </Typography>

              {isVendorAddress && (
                <Typography
                  style={{
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordWrap: 'normal',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    flexDirection: 'column',
                    fontWeight: '400',
                    fontSize: '14px',
                    color: isDarkMode ? '#FFFFFF' : primaryColor,
                  }}
                >
                  <Tooltip title={getNestedPropertyValue(item, colDef[1].field)}>
                    <Typography
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontWeight: '400',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {getNestedPropertyValue(item, colDef[1].field)}
                    </Typography>
                  </Tooltip>
                  <Tooltip title={getNestedPropertyValue(item, colDef[2].field)}>
                    <Typography
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontWeight: '400',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {getNestedPropertyValue(item, colDef[2].field)}
                    </Typography>
                  </Tooltip>
                  <Tooltip
                    title={`
                      ${
                camelCase(getNestedPropertyValue(item, colDef[5].field))
                  ? `${camelCase(getNestedPropertyValue(item, colDef[5].field))}, `
                  : ''
                }${
                  getNestedPropertyValue(item, colDef[4].field)
                    ? `${camelCase(getNestedPropertyValue(item, colDef[4].field))}`
                    : ''
                }`}
                  >
                    <Typography
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        textTransform: 'capitalize',
                        fontWeight: '400',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${
                        getNestedPropertyValue(item, colDef[5].field)
                          ? `${camelCase(getNestedPropertyValue(item, colDef[5].field))}, `
                          : ''
                      }${
                        getNestedPropertyValue(item, colDef[4].field)
                          ? `${camelCase(getNestedPropertyValue(item, colDef[4].field))}`
                          : ''
                      }`}
                    </Typography>
                  </Tooltip>
                  <Tooltip
                    title={`${getNestedPropertyValue(item, colDef[3].field)}, ${getNestedPropertyValue(
                      item,
                      colDef[6].field
                    )}`}
                  >
                    <Typography
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        fontWeight: '400',
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {`${getNestedPropertyValue(item, colDef[3].field)}, ${getNestedPropertyValue(
                        item,
                        colDef[6].field
                      )}`}
                    </Typography>
                  </Tooltip>
                </Typography>
              )}
              {isVendorDocument || isVendorLocationDocument ? (
                <Grid container spacing={0} key={index}>
                  <Grid xs={2}>
                    {(isVendorDocument || isVendorLocationDocument) && (
                      <>
                        {isVendorDocument && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                              fontSize: '12px',
                              color: primaryColor,
                            }}
                          >
                            Other Name
                          </Typography>
                        )}
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          <Tooltip title={getNestedPropertyValue(item, colDef[1].field)}>
                            <Typography
                              style={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordWrap: 'normal',
                                whiteSpace: 'nowrap',
                                color: isDarkMode ? '#FFFFFF' : primaryColor,
                                fontSize: '14px',
                              }}
                            >
                              {getNestedPropertyValue(item, colDef[1].field)}
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </>
                    )}
                  </Grid>
                  <Grid xs={2}>
                    {(isVendorDocument || isVendorLocationDocument) && (
                      <>
                        {isVendorDocument && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: primaryColor,
                            }}
                          >
                            Start Date
                          </Typography>
                        )}
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            flexDirection: 'column',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          <Tooltip title={moment(getNestedPropertyValue(item, colDef[2].field)).format('DD-MMM-YYYY')}>
                            <Typography
                              style={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordWrap: 'normal',
                                whiteSpace: 'nowrap',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: isDarkMode ? '#FFFFFF' : primaryColor,
                              }}
                            >
                              {moment(getNestedPropertyValue(item, colDef[2].field)).format('DD-MMM-YYYY')}
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </>
                    )}
                  </Grid>
                  <Grid xs={3}>
                    {(isVendorDocument || isVendorLocationDocument) && (
                      <>
                        {isVendorDocument && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: primaryColor,
                            }}
                          >
                            Expiration Date
                          </Typography>
                        )}

                        {getNestedPropertyValue(item, colDef[3].field) && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'normal',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              flexDirection: 'column',
                              color: isDarkMode ? '#FFFFFF' : primaryColor,
                            }}
                          >
                            <Tooltip
                              title={moment(getNestedPropertyValue(item, colDef[3].field)).format('DD-MMM-YYYY')}
                            >
                              <Typography
                                style={{
                                  textAlign: 'center',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordWrap: 'normal',
                                  whiteSpace: 'nowrap',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: isDarkMode ? '#FFFFFF' : primaryColor,
                                }}
                              >
                                {moment(getNestedPropertyValue(item, colDef[3].field)).format('DD-MMM-YYYY')}
                              </Typography>
                            </Tooltip>
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>
                  <Grid xs={2}>
                    {(isVendorDocument || isVendorLocationDocument) && (
                      <>
                        {isVendorDocument && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: primaryColor,
                            }}
                          >
                            Status
                          </Typography>
                        )}
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            flexDirection: 'column',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          <Tooltip title={getNestedPropertyValue(item, colDef[4].field)}>
                            <Typography
                              style={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordWrap: 'normal',
                                whiteSpace: 'nowrap',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: isDarkMode ? '#FFFFFF' : primaryColor,
                              }}
                            >
                              {getNestedPropertyValue(item, colDef[4].field)}
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </>
                    )}
                  </Grid>
                  <Grid xs={3}>
                    {(isVendorDocument || isVendorLocationDocument) && (
                      <>
                        {isVendorDocument && (
                          <Typography
                            style={{
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: primaryColor,
                            }}
                          >
                            Last Updated
                          </Typography>
                        )}

                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            flexDirection: 'column',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          <Tooltip title={getNestedPropertyValue(item, colDef[5].field)}>
                            <Typography
                              style={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordWrap: 'normal',
                                whiteSpace: 'nowrap',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: isDarkMode ? '#FFFFFF' : primaryColor,
                              }}
                            >
                              {getNestedPropertyValue(item, colDef[5].field)}
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              ) : (
                ''
              )}
              {isAirportBulletins && (
                <Grid container spacing={3} key={index} xs={12}>
                  <Grid xs={3}>
                    {getNestedPropertyValue(item, colDef[1].field) && (
                      <Typography
                        style={{
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordWrap: 'normal',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          flexDirection: 'column',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: isDarkMode ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        <Tooltip
                          title={moment.utc(getNestedPropertyValue(item, colDef[1].field)).format('DD MMM YYYY')}
                        >
                          <Typography
                            style={{
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'normal',
                              whiteSpace: 'nowrap',
                              color: isDarkMode ? '#FFFFFF' : primaryColor,
                              fontSize: '14px',
                            }}
                          >
                            {moment.utc(getNestedPropertyValue(item, colDef[1].field)).format('DD MMM YYYY')}
                          </Typography>
                        </Tooltip>
                      </Typography>
                    )}
                  </Grid>
                  <Grid xs={2}>
                    {getNestedPropertyValue(item, colDef[2].field) && (
                      <Typography
                        style={{
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordWrap: 'normal',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          flexDirection: 'column',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: isDarkMode ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        <Tooltip
                          title={moment.utc(getNestedPropertyValue(item, colDef[2].field)).format('DD MMM YYYY')}
                        >
                          <Typography
                            style={{
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'normal',
                              whiteSpace: 'nowrap',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: isDarkMode ? '#FFFFFF' : primaryColor,
                            }}
                          >
                            {moment.utc(getNestedPropertyValue(item, colDef[2].field)).format('DD MMM YYYY')}
                          </Typography>
                        </Tooltip>
                      </Typography>
                    )}
                  </Grid>
                  <Grid xs={3}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[3].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[3].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={4}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[4].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[4].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {isHandlerEvents && (
                <Grid container spacing={3} key={index} xs={12}>
                  <Grid xs={3}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[1].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[1].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[2].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[2].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={3}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[3].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[3].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    {getNestedPropertyValue(item, colDef[4].field) && (
                      <Typography
                        style={{
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordWrap: 'normal',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          flexDirection: 'column',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: isDarkMode ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        <Tooltip
                          title={moment.utc(getNestedPropertyValue(item, colDef[4].field)).format('DD MMM YYYY')}
                        >
                          <Typography
                            style={{
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'normal',
                              whiteSpace: 'nowrap',
                              color: isDarkMode ? '#FFFFFF' : primaryColor,
                              fontSize: '14px',
                            }}
                          >
                            {moment.utc(getNestedPropertyValue(item, colDef[4].field)).format('DD MMM YYYY')}
                          </Typography>
                        </Tooltip>
                      </Typography>
                    )}
                  </Grid>
                  <Grid xs={2}>
                    {getNestedPropertyValue(item, colDef[5].field) && (
                      <Typography
                        style={{
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordWrap: 'normal',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          flexDirection: 'column',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: isDarkMode ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        <Tooltip
                          title={moment.utc(getNestedPropertyValue(item, colDef[5].field)).format('DD MMM YYYY')}
                        >
                          <Typography
                            style={{
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'normal',
                              whiteSpace: 'nowrap',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: isDarkMode ? '#FFFFFF' : primaryColor,
                            }}
                          >
                            {moment.utc(getNestedPropertyValue(item, colDef[5].field)).format('DD MMM YYYY')}
                          </Typography>
                        </Tooltip>
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}
              {isVendorUser && (
                <Grid container spacing={2} key={index}>
                  <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[2].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                            fontSize: '14px',
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[2].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      <Tooltip title={getNestedPropertyValue(item, colDef[3].field)}>
                        <Typography
                          style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordWrap: 'normal',
                            whiteSpace: 'nowrap',
                            color: isDarkMode ? '#FFFFFF' : primaryColor,
                            fontSize: '14px',
                          }}
                        >
                          {getNestedPropertyValue(item, colDef[3].field)}
                        </Typography>
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Checkbox checked={item.phoneNo != null && item.phoneNo !== ''} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'normal',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: isDarkMode ? '#FFFFFF' : primaryColor,
                      }}
                    >
                      {getNestedPropertyValue(item, colDef[4].field)}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid
              item
              xs={isVendorDocument || isVendorLocationDocument || isVendorUser ? 1 : 2}
              className={`${classes.gridActionsWrapper} ${isVendorAddress ? 'vendorAddressPage' : ''}`}
            >
              {isVendorDocument ||
                (isVendorLocationDocument && (
                  <PrimaryButton variant="text" onClick={() => onDownload(item)}>
                    <DownloadIcon size="medium" />
                  </PrimaryButton>
                ))}
              {showDetailButton && (
                <PrimaryButton
                  variant="contained"
                  style={{ marginRight: '20px', color: '#ffffff' }}
                  onClick={e => onDetails(item, e)}
                >
                  <SearchIcon size="medium" />
                </PrimaryButton>
              )}
              {showEditButton && (
                <PrimaryButton variant="text" onClick={e => onEdit(item, e)}>
                  <EditIcon size="medium" />
                </PrimaryButton>
              )}
              {showDeleteButton && (
                <PrimaryButton variant="text" onClick={() => onDelete(item)}>
                  <TrashIcon size="medium" />
                </PrimaryButton>
              )}
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
};

export default inject('vendorLocationStore', 'vendorManagementStore')(withStyles(styles)(observer(CustomList)));
