import React, { useMemo } from "react";
import { Card, CardContent, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AttachMoney, CreditCard, Person, ShoppingBag } from "@mui/icons-material";
import styles from "../../../styles/AdminCustomers.module.css";

type Props = {
  loading: boolean;
  totalClientes: number;
  clientesActivos: number;
  clientesConCredito: number;
  saldoTotal: number;
  formatMoneda: (valor: number) => string;
};

const CustomerStatsSection: React.FC<Props> = ({
  loading,
  totalClientes,
  clientesActivos,
  clientesConCredito,
  saldoTotal,
  formatMoneda,
}) => {
  const skeletonStats = useMemo(() => Array.from({ length: 4 }), []);

  if (loading) {
    return (
      <Grid container spacing={2} className={styles.statsGrid}>
        {skeletonStats.map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
            <Card className={`${styles.statCard} ${styles.statCardLight}`}>
              <CardContent className={styles.statCardContent}>
                <div style={{ flex: 1 }}>
                  <Skeleton width="55%" height={18} />
                  <Skeleton width="70%" height={34} />
                </div>
                <Skeleton variant="circular" width={42} height={42} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} className={styles.statsGrid}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card className={`${styles.statCard} ${styles.statCardPink}`}>
          <CardContent className={styles.statCardContent}>
            <div>
              <Typography className={styles.statLabelWhite}>Total de clientes</Typography>
              <Typography className={styles.statValueWhite}>{totalClientes}</Typography>
            </div>
            <Person className={styles.statIconWhite} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card className={`${styles.statCard} ${styles.statCardHotPink}`}>
          <CardContent className={styles.statCardContent}>
            <div>
              <Typography className={styles.statLabelWhite}>Clientes activos</Typography>
              <Typography className={styles.statValueWhite}>{clientesActivos}</Typography>
            </div>
            <ShoppingBag className={styles.statIconWhite} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card className={`${styles.statCard} ${styles.statCardSoftPink}`}>
          <CardContent className={styles.statCardContent}>
            <div>
              <Typography className={styles.statLabelWhite}>Con crédito</Typography>
              <Typography className={styles.statValueWhite}>{clientesConCredito}</Typography>
            </div>
            <CreditCard className={styles.statIconWhite} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card className={`${styles.statCard} ${styles.statCardLight}`}>
          <CardContent className={styles.statCardContent}>
            <div>
              <Typography className={styles.statLabelDark}>Saldo por cobrar</Typography>
              <Typography className={styles.statValuePink}>{formatMoneda(saldoTotal)}</Typography>
            </div>
            <AttachMoney className={styles.statIconPink} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CustomerStatsSection;
