<?php
//die(format('2100000000000001'));
$RewardDivisor = 25;
$SupplyMultiplier = 53;
$MSupply = gmp_sub(gmp_pow(2, $SupplyMultiplier), 1);
$NumBlocks = gmp_pow(2, $SupplyMultiplier - $RewardDivisor);
$A = gmp_mul(0, 0);
$b = 0;
$BaseReward = gmp_mul(0, 0);
printf("Recompensa total %s\n",format($MSupply));
sleep(5);
while (true) {
    $BaseReward = gmp_add(gmp_shiftr(gmp_sub($MSupply, $A), $RewardDivisor), 1);
    if (gmp_cmp(gmp_sub($MSupply, $A), 0) == 0) {
        printf("Reward %s, already gave %s, to give %s at block %s eq %.02lf years\n",
            $BaseReward,
            $A,
            gmp_sub($MSupply,$A),
            $b,
            $b / (8640 * 365.25)
        );
        return;
    } else {
        if ($b % 10000 == 0)
            printf("Reward %s, already gave %s, to give %s at block %s eq %.02lf years\n",
                format($BaseReward),
                format($A),
                format(gmp_sub($MSupply,$A)),
                number_format($b,0),
                $b / (8640 * 365.25)
                );
        $b++;
        $A = gmp_add($A, $BaseReward);
    }
}


function gmp_shiftl($x, $n)
{ // shift left
    return (gmp_mul($x, gmp_pow(2, $n)));
}

function gmp_shiftr($x, $n)
{ // shift right
    return (gmp_div($x, gmp_pow(2, $n)));
}

function format($n) {
    if(strlen($n)<9) $n=str_repeat('0',9-strlen($n)).$n;
    $d=substr($n,strlen($n)-8,8);
    $e=number_format(substr($n,0,strlen($n)-8),0);

    return $e.'.'.$d;
}